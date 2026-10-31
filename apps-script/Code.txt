/**
 * হিসাব খাতা — Google Apps Script ব্যাকএন্ড
 * ------------------------------------------------
 * এই স্ক্রিপ্টটি একটি Google Sheet-কে ওয়েবসাইটের ডাটাবেস API বানিয়ে দেয়।
 * setup নির্দেশনা README.md ফাইলে দেখুন।
 */

// প্রতিটি "টেবিল" এর কলাম হেডার এখানে সংজ্ঞায়িত করা আছে।
// প্রথম কলাম সবসময় id — এটি স্বয়ংক্রিয়ভাবে তৈরি হয়।
const HEADERS = {
  Income:          ['id', 'date', 'category', 'amount', 'note'],
  Expense:         ['id', 'date', 'category', 'amount', 'note'],
  Debtors:         ['id', 'date', 'name', 'amount', 'type', 'reason', 'note'],
  Creditors:       ['id', 'date', 'name', 'amount', 'type', 'reason', 'note'],
  Deposits:        ['id', 'date', 'name', 'type', 'amount', 'reason'],
  CashTx:          ['id', 'date', 'type', 'amount', 'source', 'note'],
  BankAccounts:    ['id', 'bankName', 'accountNumber', 'note'],
  BankTx:          ['id', 'date', 'accountId', 'type', 'amount', 'note'],
  MobileAccounts:  ['id', 'provider', 'accountNumber', 'note'],
  MobileTx:        ['id', 'date', 'accountId', 'type', 'amount', 'note'],
  Investments:     ['id', 'date', 'name', 'amount', 'currentValue', 'note'],
  Dividends:       ['id', 'date', 'investmentName', 'amount', 'note'],
  Assets:          ['id', 'date', 'name', 'type', 'amount', 'currentValue', 'status', 'note', 'depreciationRate', 'depreciationMethod'],
  TaxSlabs:        ['id', 'order', 'sliceAmount', 'ratePercent', 'note'],
  TaxSettings:     ['id', 'exemptionAmount', 'minimumTax'],
  BudgetPlan:      ['id', 'order', 'category', 'percent'],
  MonthlyBudgets:  ['id', 'date', 'amount', 'allocations', 'note']
};

// মাসিক বাজেটের ডিফল্ট ক্যাটেগরি ও শতাংশ (ওয়েবসাইটের "বাজেট শতাংশ" ট্যাব থেকে বদলানো যায়)
const BUDGET_PLAN_DEFAULTS = [
  { order: 1, category: 'খাবার', percent: 40 },
  { order: 2, category: 'বাসা ভাড়া', percent: 20 },
  { order: 3, category: 'ইউটিলিটি বিল', percent: 5 },
  { order: 4, category: 'চিকিৎসা/ঔষধ', percent: 5 },
  { order: 5, category: 'শিক্ষা', percent: 10 },
  { order: 6, category: 'অন্যান্য', percent: 5 },
  { order: 7, category: 'সঞ্চয়', percent: 10 }
];

// নতুন শিট প্রথমবার তৈরি হলে এই ডিফল্ট মানগুলো বসানো হয় (আয়কর আইন ২০২৩ অনুযায়ী
// ২০২৬-২৭ ও ২০২৭-২৮ করবর্ষের ব্যক্তি করদাতার হার)। আইন/হার বদলালে কোডে হাত না দিয়ে
// ওয়েবসাইটের "আয়কর স্ল্যাব" ও "কর সেটিংস" ট্যাব থেকে বদলে নিন।
const TAX_SLAB_DEFAULTS = [
  { order: 1, sliceAmount: 300000,  ratePercent: 10, note: 'করমুক্ত সীমার পর প্রথম ধাপ' },
  { order: 2, sliceAmount: 400000,  ratePercent: 15, note: 'দ্বিতীয় ধাপ' },
  { order: 3, sliceAmount: 500000,  ratePercent: 20, note: 'তৃতীয় ধাপ' },
  { order: 4, sliceAmount: 2000000, ratePercent: 25, note: 'চতুর্থ ধাপ' },
  { order: 5, sliceAmount: 0,       ratePercent: 30, note: 'অবশিষ্ট আয় (০ = সীমাহীন শেষ ধাপ)' }
];
const TAX_SETTINGS_DEFAULTS = { exemptionAmount: 375000, minimumTax: 5000 };

function doGet(e) {
  return handleRequest(e);
}
function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    // --- নিরাপত্তা: টোকেন যাচাই ---
    // যেহেতু এই ওয়েবসাইটের কোড গিটহাবে পাবলিক থাকবে, তাই URL কারো হাতে পড়লেও
    // সঠিক টোকেন ছাড়া কেউ আপনার শিট পড়তে বা লিখতে পারবে না।
    // Apps Script Editor > Project Settings > Script Properties এ API_TOKEN সেট করুন।
    const requiredToken = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
    if (requiredToken && params.token !== requiredToken) {
      return jsonOutput({ ok: false, error: 'টোকেন সঠিক নয় — অনুমতি নেই' });
    }

    const action = params.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'dashboard') {
      return jsonOutput({ ok: true, data: getDashboardData(ss) });
    }
    if (action === 'meta') {
      return jsonOutput({ ok: true, data: { sheets: Object.keys(HEADERS) } });
    }

    const sheetName = params.sheet;
    if (!sheetName || !HEADERS[sheetName]) {
      return jsonOutput({ ok: false, error: 'অজানা শিট: ' + sheetName });
    }
    const sheet = getOrCreateSheet(ss, sheetName);

    switch (action) {
      case 'list':
        return jsonOutput({ ok: true, data: listRows(sheet, sheetName) });
      case 'add': {
        const data = JSON.parse(params.data || '{}');
        return jsonOutput({ ok: true, data: addRow(sheet, sheetName, data) });
      }
      case 'update': {
        const data = JSON.parse(params.data || '{}');
        return jsonOutput({ ok: true, data: updateRow(sheet, sheetName, data) });
      }
      case 'delete':
        return jsonOutput({ ok: true, data: deleteRow(sheet, params.id) });
      default:
        return jsonOutput({ ok: false, error: 'অজানা action: ' + action });
    }
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// এই কলামগুলো সবসময় টেক্সট হিসেবে সংরক্ষিত হয় (যাতে 01711… এর শুরুর ০ হারিয়ে না যায়)
const TEXT_COLS = ['accountNumber'];

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  let fresh = false;
  if (!sheet) { sheet = ss.insertSheet(name); fresh = true; }
  else if (sheet.getLastRow() === 0) { fresh = true; }
  else if (sheet.getLastColumn() < HEADERS[name].length) {
    // পুরনো শিটে নতুন কলাম যোগ হলে হেডার আপগ্রেড (মাইগ্রেশন)
    const need = HEADERS[name].length;
    if (sheet.getMaxColumns() < need) sheet.insertColumnsAfter(sheet.getMaxColumns(), need - sheet.getMaxColumns());
    sheet.getRange(1, 1, 1, need).setValues([HEADERS[name]]);
  }
  if (fresh) {
    sheet.appendRow(HEADERS[name]);
    sheet.setFrozenRows(1);
    seedDefaults(sheet, name);
  }
  return sheet;
}

function seedDefaults(sheet, name) {
  const headers = HEADERS[name];
  const put = row => sheet.appendRow(headers.map(h => (row[h] !== undefined ? row[h] : '')));
  if (name === 'TaxSlabs') {
    TAX_SLAB_DEFAULTS.forEach((d, i) => put(Object.assign({ id: 'slab' + (i + 1) }, d)));
  } else if (name === 'TaxSettings') {
    put(Object.assign({ id: 'settings' }, TAX_SETTINGS_DEFAULTS));
  } else if (name === 'BudgetPlan') {
    BUDGET_PLAN_DEFAULTS.forEach((d, i) => put(Object.assign({ id: 'plan' + (i + 1) }, d)));
  }
}

// বাংলাদেশের অর্থবছর/করবছর: ১ জুলাই – ৩০ জুন
function currentTaxYearRange() {
  const now = new Date();
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    start: new Date(startYear, 6, 1),
    end: new Date(startYear + 1, 5, 30, 23, 59, 59),
    label: startYear + '-' + String(startYear + 1).slice(-2)
  };
}

function inRange(dateVal, range) {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  return !isNaN(d) && d >= range.start && d <= range.end;
}

// সম্পদের বর্তমান মূল্য: হাতে দেয়া মূল্য থাকলে সেটা, নাহলে অবচয় (depreciation) হিসাব করে।
// পদ্ধতি: straight = সরলরৈখিক (প্রতি বছর ক্রয়মূল্যের একই %), declining = হ্রাসমান ব্যালেন্স
function assetValue(r) {
  const cost = parseFloat(r.amount) || 0;
  if (r.currentValue !== '' && r.currentValue !== null && r.currentValue !== undefined) {
    return parseFloat(r.currentValue) || 0;
  }
  const rate = parseFloat(r.depreciationRate) || 0;
  if (!rate || !r.date) return cost;
  const years = Math.max(0, (new Date() - new Date(r.date)) / (365.25 * 86400000));
  return r.depreciationMethod === 'declining'
    ? cost * Math.pow(1 - rate / 100, years)
    : Math.max(0, cost * (1 - rate / 100 * years));
}

// করমুক্ত সীমা বাদ দেয়ার পরের আয়ের উপর স্ল্যাব ধরে ধরে কর হিসাব
function computeTax(taxable, slabs) {
  let remaining = taxable, tax = 0;
  const sorted = slabs.slice().sort((a, b) => (parseFloat(a.order) || 0) - (parseFloat(b.order) || 0));
  for (let i = 0; i < sorted.length && remaining > 0; i++) {
    const width = parseFloat(sorted[i].sliceAmount) || 0;
    const rate = (parseFloat(sorted[i].ratePercent) || 0) / 100;
    const portion = width > 0 ? Math.min(remaining, width) : remaining;
    tax += portion * rate;
    remaining -= portion;
  }
  return tax;
}

function listRows(sheet, sheetName) {
  const headers = HEADERS[sheetName];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const tz = sheet.getParent().getSpreadsheetTimeZone();
  return values
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const v = row[i];
        // তারিখকে yyyy-MM-dd স্ট্রিং বানানো হয়, যাতে টাইমজোনের কারণে দিন/মাস গোলমাল না হয়
        obj[h] = (v instanceof Date) ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v;
      });
      return obj;
    })
    .filter(obj => obj.id !== '' && obj.id !== null);
}

function addRow(sheet, sheetName, data) {
  const headers = HEADERS[sheetName];
  const id = 'r' + new Date().getTime() + Math.floor(Math.random() * 1000);
  data.id = id;
  const row = headers.map(h => (data[h] !== undefined ? data[h] : ''));
  const rowNum = sheet.getLastRow() + 1;
  setTextFormats(sheet, headers, rowNum);
  sheet.getRange(rowNum, 1, 1, headers.length).setValues([row]);
  return data;
}

function setTextFormats(sheet, headers, rowNum) {
  TEXT_COLS.forEach(c => {
    const i = headers.indexOf(c);
    if (i >= 0) sheet.getRange(rowNum, i + 1).setNumberFormat('@');
  });
}

function updateRow(sheet, sheetName, data) {
  const headers = HEADERS[sheetName];
  const idCol = headers.indexOf('id') + 1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('রো পাওয়া যায়নি');
  const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(data.id)) {
      const rowNum = i + 2;
      const row = headers.map(h => (data[h] !== undefined ? data[h] : ''));
      setTextFormats(sheet, headers, rowNum);
      sheet.getRange(rowNum, 1, 1, headers.length).setValues([row]);
      return data;
    }
  }
  throw new Error('আইডি পাওয়া যায়নি: ' + data.id);
}

function deleteRow(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('রো পাওয়া যায়নি');
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return { deleted: id };
    }
  }
  throw new Error('আইডি পাওয়া যায়নি: ' + id);
}

// ------------------------------------------------------------------
// ড্যাশবোর্ডের সব হিসাব একসাথে করে পাঠানো হয় এখান থেকে
// ------------------------------------------------------------------
function getDashboardData(ss) {
  const income = listRows(getOrCreateSheet(ss, 'Income'), 'Income');
  const expense = listRows(getOrCreateSheet(ss, 'Expense'), 'Expense');
  const debtors = listRows(getOrCreateSheet(ss, 'Debtors'), 'Debtors');
  const creditors = listRows(getOrCreateSheet(ss, 'Creditors'), 'Creditors');
  const deposits = listRows(getOrCreateSheet(ss, 'Deposits'), 'Deposits');
  const cashTx = listRows(getOrCreateSheet(ss, 'CashTx'), 'CashTx');
  const bankTx = listRows(getOrCreateSheet(ss, 'BankTx'), 'BankTx');
  const bankAccounts = listRows(getOrCreateSheet(ss, 'BankAccounts'), 'BankAccounts');
  const mobileTx = listRows(getOrCreateSheet(ss, 'MobileTx'), 'MobileTx');
  const mobileAccounts = listRows(getOrCreateSheet(ss, 'MobileAccounts'), 'MobileAccounts');
  const investments = listRows(getOrCreateSheet(ss, 'Investments'), 'Investments');
  const dividends = listRows(getOrCreateSheet(ss, 'Dividends'), 'Dividends');
  const assets = listRows(getOrCreateSheet(ss, 'Assets'), 'Assets');

  const sum = (arr, key) => arr.reduce((s, r) => s + (parseFloat(r[key]) || 0), 0);

  const totalIncome = sum(income, 'amount');
  const totalExpense = sum(expense, 'amount');

  // ক্যাশ: আয় - ব্যয় + ক্যাশ জমা - ক্যাশ উত্তোলন - ব্যাংকে/মোবাইলে জমা করা টাকা + সেখান থেকে তোলা টাকা
  const cashIn = sum(cashTx.filter(r => r.type === 'in'), 'amount');
  const cashOut = sum(cashTx.filter(r => r.type === 'out'), 'amount');
  const cashBalance = totalIncome - totalExpense + cashIn - cashOut;

  // ব্যাংক ব্যালেন্স (প্রতিটি অ্যাকাউন্ট আলাদা করে)
  const bankByAccount = {};
  bankAccounts.forEach(acc => { bankByAccount[acc.id] = 0; });
  bankTx.forEach(tx => {
    const sign = (tx.type === 'deposit' || tx.type === 'transfer_in') ? 1 : -1;
    bankByAccount[tx.accountId] = (bankByAccount[tx.accountId] || 0) + sign * (parseFloat(tx.amount) || 0);
  });
  const bankTotal = Object.values(bankByAccount).reduce((a, b) => a + b, 0);
  const bankBreakdown = bankAccounts.map(acc => ({
    id: acc.id, bankName: acc.bankName, accountNumber: acc.accountNumber,
    balance: bankByAccount[acc.id] || 0
  }));

  // মোবাইল ব্যাংকিং ব্যালেন্স
  const mobileByAccount = {};
  mobileAccounts.forEach(acc => { mobileByAccount[acc.id] = 0; });
  mobileTx.forEach(tx => {
    const sign = (tx.type === 'deposit' || tx.type === 'transfer_in') ? 1 : -1;
    mobileByAccount[tx.accountId] = (mobileByAccount[tx.accountId] || 0) + sign * (parseFloat(tx.amount) || 0);
  });
  const mobileTotal = Object.values(mobileByAccount).reduce((a, b) => a + b, 0);
  const mobileBreakdown = mobileAccounts.map(acc => ({
    id: acc.id, provider: acc.provider, accountNumber: acc.accountNumber,
    balance: mobileByAccount[acc.id] || 0
  }));

  // দেনাদার (আমি পাব): দিলাম বাড়ায়, ফেরত পেলাম কমায়
  const debtorsNet = sum(debtors.filter(r => r.type === 'gave'), 'amount')
    - sum(debtors.filter(r => r.type === 'received_back'), 'amount');

  // পাওনাদার (আমি দেব): নিলাম বাড়ায়, ফেরত দিলাম কমায়
  const creditorsNet = sum(creditors.filter(r => r.type === 'took'), 'amount')
    - sum(creditors.filter(r => r.type === 'paid_back'), 'amount');

  // অন্যের আমানত (আমার কাছে জমা রাখা টাকা — এটা আমার সম্পদ নয়, দায়)
  const depositsNet = sum(deposits.filter(r => r.type === 'deposit'), 'amount')
    - sum(deposits.filter(r => r.type === 'withdraw'), 'amount')
    - sum(deposits.filter(r => r.type === 'spent'), 'amount');

  // বিনিয়োগ
  const investedTotal = sum(investments, 'amount');
  const investmentCurrentTotal = investments.reduce(
    (s, r) => s + (parseFloat(r.currentValue) || parseFloat(r.amount) || 0), 0
  );
  const investmentProfitLoss = investmentCurrentTotal - investedTotal;
  const dividendTotal = sum(dividends, 'amount');

  // সম্পদ (বিক্রি না হওয়া সম্পদের বর্তমান মূল্য)
  const activeAssets = assets.filter(r => r.status !== 'sold');
  const assetsTotal = activeAssets.reduce((s, r) => s + assetValue(r), 0);
  const assetsCost = sum(activeAssets, 'amount');
  const assetsDepreciation = assetsCost - assetsTotal;

  // অন্যের আমানত — কার কাছে কত (নাম অনুযায়ী)
  const depMap = {};
  deposits.forEach(r => {
    const n = String(r.name || '').trim() || '(নাম নেই)';
    const o = depMap[n] = depMap[n] || { name: n, deposit: 0, withdraw: 0, spent: 0 };
    o[r.type] = (o[r.type] || 0) + (parseFloat(r.amount) || 0);
  });
  const depositsByPerson = Object.keys(depMap).map(n => {
    const o = depMap[n]; o.balance = o.deposit - o.withdraw - o.spent; return o;
  });

  // যাকাতযোগ্য সম্পদ (আনুমানিক):
  // ক্যাশ + ব্যাংক + মোবাইল ব্যাংকিং + বিনিয়োগের বর্তমান মূল্য + দেনাদার(পাব) - পাওনাদার(দেব) - অন্যের আমানত
  // স্থায়ী সম্পদ (Assets) সাধারণত যাকাতের হিসাবে ধরা হয় না, তাই বাদ দেয়া হয়েছে।
  const zakatBase = cashBalance + bankTotal + mobileTotal + investmentCurrentTotal
    + debtorsNet - creditorsNet - depositsNet;
  const zakatAmount = zakatBase > 0 ? zakatBase * 0.025 : 0;

  // ---- আয়কর (চলতি করবছর, সাধারণ আনুমানিক হিসাব) ----
  // করযোগ্য আয় = চলতি করবছরের (জুলাই–জুন) আয় + লভ্যাংশ − করমুক্ত সীমা
  const fy = currentTaxYearRange();
  const slabs = listRows(getOrCreateSheet(ss, 'TaxSlabs'), 'TaxSlabs');
  const settingsRows = listRows(getOrCreateSheet(ss, 'TaxSettings'), 'TaxSettings');
  const st = settingsRows.find(r => r.id === 'settings') || {};
  const exemptionAmount = st.exemptionAmount !== undefined && st.exemptionAmount !== ''
    ? parseFloat(st.exemptionAmount) : TAX_SETTINGS_DEFAULTS.exemptionAmount;
  const minimumTax = st.minimumTax !== undefined && st.minimumTax !== ''
    ? parseFloat(st.minimumTax) : TAX_SETTINGS_DEFAULTS.minimumTax;
  const taxYearIncome = sum(income.filter(r => inRange(r.date, fy)), 'amount')
    + sum(dividends.filter(r => inRange(r.date, fy)), 'amount');
  const taxableIncome = Math.max(0, taxYearIncome - exemptionAmount);
  let taxBeforeMin = computeTax(taxableIncome, slabs);
  let estimatedTax = taxBeforeMin;
  let minimumApplied = false;
  if (taxableIncome > 0 && estimatedTax < minimumTax) { estimatedTax = minimumTax; minimumApplied = true; }

  return {
    taxYearLabel: fy.label, taxYearIncome, exemptionAmount, taxableIncome,
    taxBeforeMin, estimatedTax, minimumTax, minimumApplied,
    totalIncome, totalExpense,
    cashBalance,
    bankTotal, bankBreakdown,
    mobileTotal, mobileBreakdown,
    debtorsNet, creditorsNet, depositsNet,
    investedTotal, investmentCurrentTotal, investmentProfitLoss, dividendTotal,
    assetsTotal, assetsCost, assetsDepreciation, depositsByPerson,
    zakatBase, zakatAmount
  };
}
