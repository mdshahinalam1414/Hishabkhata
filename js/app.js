// ============================================================
// হিসাব খাতা — মডিউল সংজ্ঞা
// প্রতিটি মডিউল একটি Google Sheet ট্যাবের সাথে সংযুক্ত।
// ============================================================

const MODULES = {
  Income: {
    label: "আয়",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "category", label: "উৎস / খাত", type: "text", required: true },
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Expense: {
    label: "ব্যয়",
    helpText: "খাত বেছে নিলে খরচটি ঐ মাসের বাজেটের সাথে মিলিয়ে হিসাব হবে। খাতের তালিকা 'বাজেট শতাংশ' ট্যাব থেকে আসে।",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "category", label: "খাত (বাজেট ক্যাটেগরি)", type: "budgetcat", required: true },
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Debtors: {
    label: "দেনাদার (আমি পাব)",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "type", label: "ধরন", type: "select", required: true, options: [
        { value: "gave", label: "টাকা দিলাম (পাব)" },
        { value: "received_back", label: "ফেরত পেলাম" }
      ]},
      { key: "reason", label: "কারণ", type: "text" },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Creditors: {
    label: "পাওনাদার (আমি দেব)",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "type", label: "ধরন", type: "select", required: true, options: [
        { value: "took", label: "টাকা নিলাম (দেব)" },
        { value: "paid_back", label: "ফেরত দিলাম" }
      ]},
      { key: "reason", label: "কারণ", type: "text" },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Deposits: {
    label: "অন্যের আমানত",
    helpText: "অন্যের টাকা আপনার কাছে জমা রাখা — এটা আপনার সম্পদ নয়, দায়।",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "name", label: "কার টাকা", type: "text", required: true, suggest: true },
      { key: "type", label: "ধরন", type: "select", required: true, options: [
        { value: "deposit", label: "জমা রাখলেন" },
        { value: "withdraw", label: "ফেরত নিলেন" },
        { value: "spent", label: "আমি এই টাকা থেকে খরচ করলাম" }
      ]},
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "reason", label: "কারণ", type: "text", required: true }
    ]
  },
  CashTx: {
    label: "ক্যাশ",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "type", label: "ধরন", type: "select", required: true, options: [
        { value: "in", label: "জমা হলো" },
        { value: "out", label: "উত্তোলন হলো" }
      ]},
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "source", label: "উৎস / গন্তব্য", type: "text" },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  BankAccounts: {
    label: "ব্যাংক অ্যাকাউন্ট",
    fields: [
      { key: "bankName", label: "ব্যাংকের নাম", type: "text", required: true },
      { key: "accountNumber", label: "অ্যাকাউন্ট নাম্বার", type: "text", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  BankTx: {
    label: "ব্যাংক লেনদেন",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "accountId", label: "অ্যাকাউন্ট", type: "ref", refSheet: "BankAccounts",
        refLabel: r => `${r.bankName} — ${r.accountNumber}`, required: true },
      { key: "type", label: "ধরন", type: "select", required: true, options: [
        { value: "deposit", label: "জমা" },
        { value: "withdraw", label: "উত্তোলন" },
        { value: "transfer_in", label: "ট্রান্সফার (ইন)" },
        { value: "transfer_out", label: "ট্রান্সফার (আউট)" }
      ]},
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  MobileAccounts: {
    label: "মোবাইল ব্যাংকিং অ্যাকাউন্ট",
    fields: [
      { key: "provider", label: "প্রোভাইডার (bKash/Nagad/...)", type: "text", required: true },
      { key: "accountNumber", label: "নাম্বার", type: "text", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  MobileTx: {
    label: "মোবাইল ব্যাংকিং লেনদেন",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "accountId", label: "অ্যাকাউন্ট", type: "ref", refSheet: "MobileAccounts",
        refLabel: r => `${r.provider} — ${r.accountNumber}`, required: true },
      { key: "type", label: "ধরন", type: "select", required: true, options: [
        { value: "deposit", label: "জমা" },
        { value: "withdraw", label: "উত্তোলন" },
        { value: "transfer_in", label: "ট্রান্সফার (ইন)" },
        { value: "transfer_out", label: "ট্রান্সফার (আউট)" }
      ]},
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Investments: {
    label: "বিনিয়োগ",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "name", label: "কোথায় বিনিয়োগ", type: "text", required: true },
      { key: "amount", label: "বিনিয়োগকৃত পরিমাণ (৳)", type: "number", required: true },
      { key: "currentValue", label: "বর্তমান মূল্য (৳)", type: "number" },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Dividends: {
    label: "লভ্যাংশ",
    fields: [
      { key: "date", label: "তারিখ", type: "date", required: true },
      { key: "investmentName", label: "কোন বিনিয়োগ থেকে", type: "text", required: true },
      { key: "amount", label: "পরিমাণ (৳)", type: "number", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  },
  Assets: {
    label: "সম্পদ",
    helpText: "অবচয় হার দিলে কেনার তারিখ থেকে আজ পর্যন্ত সময় ধরে সম্পদের মূল্য নিজে থেকেই কমে হিসাব হবে (ড্যাশবোর্ডেও এই মূল্য যাবে)।",
    fields: [
      { key: "date", label: "কেনার তারিখ", type: "date", required: true },
      { key: "name", label: "সম্পদের নাম", type: "text", required: true },
      { key: "amount", label: "ক্রয়মূল্য (৳)", type: "number", required: true },
      { key: "depreciationRate", percent: true, label: "বার্ষিক অবচয় হার (%) — না থাকলে ০", type: "number" },
      { key: "depreciationMethod", label: "অবচয় পদ্ধতি", type: "select", options: [
        { value: "straight", label: "সরলরৈখিক (প্রতি বছর একই %)" },
        { value: "declining", label: "হ্রাসমান ব্যালেন্স" }
      ]},
      { key: "currentValue", label: "বর্তমান মূল্য (৳) — খালি রাখলে অবচয় অনুযায়ী অটো; বিক্রি হলে বিক্রয়মূল্য", type: "number" },
      { key: "status", label: "অবস্থা", type: "select", required: true, options: [
        { value: "active", label: "আছে" },
        { value: "sold", label: "বিক্রি হয়ে গেছে" }
      ]},
      { key: "note", label: "নোট", type: "text" }
    ],
    extraColumns: [
      { label: "অবচয় (৳)", compute: r => money((Number(r.amount) || 0) - assetValue(r)) },
      { label: "হিসাবকৃত বর্তমান মূল্য", compute: r => money(assetValue(r)) }
    ]
  },
  BudgetPlan: {
    label: "বাজেট শতাংশ",
    helpText: "বেতন/আয় এন্ট্রি করলে এই শতাংশ অনুযায়ী ক্যাটেগরিতে ভাগ হবে। শতাংশ বদলালে শুধু এরপরের এন্ট্রিতে প্রযোজ্য হবে — আগের মাসগুলোর বরাদ্দ, খরচ ও ব্যালেন্স অপরিবর্তিত থাকবে। মোট ১০০% হওয়া উচিত।",
    fields: [
      { key: "order", plain: true, label: "ক্রম", type: "number", required: true },
      { key: "category", label: "ক্যাটেগরির নাম", type: "text", required: true },
      { key: "percent", percent: true, label: "শতাংশ (%)", type: "number", required: true }
    ]
  },
  TaxSlabs: {
    label: "আয়কর স্ল্যাব",
    helpText: "করমুক্ত সীমার পরের আয়ের ধাপ ও হার। আইন বা হার বদলালে এখান থেকেই বদলান — কোড বদলানোর দরকার নেই। সর্বশেষ ধাপে 'ধাপের পরিমাণ' ০ দিন (মানে অবশিষ্ট সব আয়)।",
    fields: [
      { key: "order", plain: true, label: "ক্রম (১,২,৩…)", type: "number", required: true },
      { key: "sliceAmount", label: "ধাপের পরিমাণ (৳) — শেষ ধাপে ০", type: "number", required: true },
      { key: "ratePercent", percent: true, label: "হার (%)", type: "number", required: true },
      { key: "note", label: "নোট", type: "text" }
    ]
  }
};

// সম্পদের বর্তমান মূল্য — apps-script/Code.gs এর assetValue() এর সাথে একই সূত্র
function assetValue(r) {
  const cost = Number(r.amount) || 0;
  if (r.currentValue !== "" && r.currentValue !== null && r.currentValue !== undefined) return Number(r.currentValue) || 0;
  const rate = Number(r.depreciationRate) || 0;
  if (!rate || !r.date) return cost;
  const years = Math.max(0, (Date.now() - new Date(r.date)) / (365.25 * 86400000));
  return r.depreciationMethod === "declining"
    ? cost * Math.pow(1 - rate / 100, years)
    : Math.max(0, cost * (1 - rate / 100 * years));
}

const state = { currentSheet: null, editingId: null, refCache: {} };

// ============================================================
// নেভিগেশন
// ============================================================
function buildNav() {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = "";
  const dashBtn = navButton("dashboard", "ড্যাশবোর্ড");
  dashBtn.classList.add("active");
  nav.appendChild(dashBtn);

  nav.appendChild(navButton("Budget", "মাসিক বাজেট"));

  const divider = document.createElement("div");
  divider.className = "nav-divider";
  nav.appendChild(divider);

  Object.keys(MODULES).forEach(key => {
    nav.appendChild(navButton(key, MODULES[key].label));
  });
  nav.appendChild(navButton("TaxSettings", "কর সেটিংস"));
}

function navButton(key, label) {
  const btn = document.createElement("button");
  btn.className = "nav-btn";
  btn.textContent = label;
  btn.dataset.key = key;
  btn.addEventListener("click", () => selectTab(key));
  return btn;
}

function selectTab(key) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.key === key));
  if (key === "dashboard") {
    renderDashboardView();
    loadDashboard();
  } else if (key === "Budget") {
    renderBudgetView();
  } else if (key === "TaxSettings") {
    renderTaxSettingsView();
  } else {
    renderModuleView(key);
    loadModule(key);
  }
}

// ============================================================
// ড্যাশবোর্ড
// ============================================================
function money(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? "-" : "";
  return sign + "৳" + Math.abs(v).toLocaleString("en-BD", { maximumFractionDigits: 2 });
}

function renderDashboardView() {
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <div class="page-header">
      <h1>ড্যাশবোর্ড</h1>
      <p class="page-sub">আপনার সম্পূর্ণ আর্থিক অবস্থার সারসংক্ষেপ</p>
    </div>
    <div id="dash-loading" class="loading">হিসাব লোড হচ্ছে…</div>
    <div id="dash-body" class="hidden"></div>
  `;
}

async function loadDashboard() {
  try {
    const d = await api.dashboard();
    document.getElementById("dash-loading").classList.add("hidden");
    const body = document.getElementById("dash-body");
    body.classList.remove("hidden");

    const bankRows = d.bankBreakdown.map(b =>
      `<div class="mini-row"><span>${escapeHtml(b.bankName)} — ${escapeHtml(b.accountNumber)}</span><span class="${b.balance < 0 ? 'neg' : ''}">${money(b.balance)}</span></div>`
    ).join("") || `<div class="mini-row muted">কোনো ব্যাংক অ্যাকাউন্ট যোগ করা হয়নি</div>`;

    const mobileRows = d.mobileBreakdown.map(m =>
      `<div class="mini-row"><span>${escapeHtml(m.provider)} — ${escapeHtml(m.accountNumber)}</span><span class="${m.balance < 0 ? 'neg' : ''}">${money(m.balance)}</span></div>`
    ).join("") || `<div class="mini-row muted">কোনো মোবাইল ব্যাংকিং অ্যাকাউন্ট যোগ করা হয়নি</div>`;

    body.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card featured">
          <span class="stat-label">মোট ক্যাশ ইন হ্যান্ড</span>
          <span class="stat-value">${money(d.cashBalance)}</span>
        </div>
        <div class="stat-card featured">
          <span class="stat-label">ব্যাংক ব্যালেন্স (সব মিলিয়ে)</span>
          <span class="stat-value">${money(d.bankTotal)}</span>
        </div>
        <div class="stat-card featured">
          <span class="stat-label">সম্পদের বর্তমান মূল্য</span>
          <span class="stat-value">${money(d.assetsTotal)}</span>
        </div>
        <div class="stat-card zakat">
          <span class="stat-label">যাকাত (আনুমানিক, ২.৫%)</span>
          <span class="stat-value">${money(d.zakatAmount)}</span>
        </div>
        <div class="stat-card tax">
          <span class="stat-label">আয়কর (আনুমানিক, ${d.taxYearLabel})</span>
          <span class="stat-value">${money(d.estimatedTax)}</span>
        </div>
      </div>

      <div class="panel-grid">
        <section class="panel">
          <h3>ব্যাংক হিসাব</h3>
          ${bankRows}
        </section>
        <section class="panel">
          <h3>মোবাইল ব্যাংকিং</h3>
          ${mobileRows}
        </section>
        <section class="panel">
          <h3>আয় বনাম ব্যয়</h3>
          <div class="mini-row"><span>মোট আয়</span><span>${money(d.totalIncome)}</span></div>
          <div class="mini-row"><span>মোট ব্যয়</span><span class="neg">${money(d.totalExpense)}</span></div>
          <div class="mini-row total"><span>নিট</span><span>${money(d.totalIncome - d.totalExpense)}</span></div>
        </section>
        <section class="panel">
          <h3>বিনিয়োগ</h3>
          <div class="mini-row"><span>মোট বিনিয়োগকৃত</span><span>${money(d.investedTotal)}</span></div>
          <div class="mini-row"><span>বর্তমান মূল্য</span><span>${money(d.investmentCurrentTotal)}</span></div>
          <div class="mini-row total"><span>${d.investmentProfitLoss >= 0 ? 'লাভ' : 'ক্ষতি'}</span><span class="${d.investmentProfitLoss < 0 ? 'neg' : 'pos'}">${money(d.investmentProfitLoss)}</span></div>
          <div class="mini-row"><span>মোট লভ্যাংশ পাওয়া গেছে</span><span>${money(d.dividendTotal)}</span></div>
        </section>
        <section class="panel">
          <h3>দেনাদার ও পাওনাদার</h3>
          <div class="mini-row"><span>আমি পাব (দেনাদার)</span><span>${money(d.debtorsNet)}</span></div>
          <div class="mini-row"><span>আমি দেব (পাওনাদার)</span><span class="neg">${money(d.creditorsNet)}</span></div>
          <div class="mini-row"><span>অন্যের আমানত (দায়)</span><span class="neg">${money(d.depositsNet)}</span></div>
        </section>
        <section class="panel">
          <h3>অন্যের আমানত — কার কত</h3>
          ${(d.depositsByPerson || []).map(o => `<div class="mini-row"><span>${escapeHtml(o.name)}</span><span class="${o.balance < 0 ? 'neg' : ''}">${money(o.balance)}</span></div>`).join("") || `<div class="mini-row muted">কোনো আমানত নেই</div>`}
        </section>
        <section class="panel">
          <h3>সম্পদ ও অবচয়</h3>
          <div class="mini-row"><span>ক্রয়মূল্য</span><span>${money(d.assetsCost)}</span></div>
          <div class="mini-row"><span>মোট অবচয়</span><span class="neg">− ${money(d.assetsDepreciation)}</span></div>
          <div class="mini-row total"><span>বর্তমান মূল্য</span><span>${money(d.assetsTotal)}</span></div>
        </section>
        <section class="panel">
          <h3>আয়কর হিসাব (${d.taxYearLabel} করবছর)</h3>
          <div class="mini-row"><span>এই করবছরের আয় + লভ্যাংশ</span><span>${money(d.taxYearIncome)}</span></div>
          <div class="mini-row"><span>করমুক্ত সীমা</span><span class="neg">− ${money(d.exemptionAmount)}</span></div>
          <div class="mini-row"><span>করযোগ্য আয়</span><span>${money(d.taxableIncome)}</span></div>
          <div class="mini-row"><span>স্ল্যাব অনুযায়ী কর</span><span>${money(d.taxBeforeMin)}</span></div>
          ${d.minimumApplied ? `<div class="mini-row"><span>ন্যূনতম কর প্রযোজ্য</span><span>${money(d.minimumTax)}</span></div>` : ""}
          <div class="mini-row total"><span>আনুমানিক প্রদেয় কর</span><span>${money(d.estimatedTax)}</span></div>
        </section>
        <section class="panel note-panel">
          <h3>আয়করের হিসাব সম্পর্কে</h3>
          <p>করবছর = ১ জুলাই থেকে ৩০ জুন। হিসাবে শুধু "আয়" ও "লভ্যাংশ" ট্যাবের এন্ট্রি ধরা হয়েছে। বিনিয়োগ রেয়াত, উৎসে কর, বিভিন্ন খাতের ছাড় ধরা হয়নি — এটি একটি আনুমানিক হিসাব। রিটার্ন দেয়ার আগে NBR বা ট্যাক্স উপদেষ্টার সাথে মিলিয়ে নিন। করমুক্ত সীমা ও স্ল্যাব "কর সেটিংস" ও "আয়কর স্ল্যাব" ট্যাবে বদলানো যায়।</p>
        </section>
        <section class="panel note-panel">
          <h3>যাকাতের হিসাব সম্পর্কে</h3>
          <p>যাকাতযোগ্য সম্পদ = ক্যাশ + ব্যাংক + মোবাইল ব্যাংকিং + বিনিয়োগের বর্তমান মূল্য + দেনাদার − পাওনাদার − অন্যের আমানত।</p>
          <p>স্থায়ী ব্যবহারের সম্পদ (Assets ট্যাব) এই হিসাবে যোগ করা হয়নি। এটি একটি আনুমানিক হিসাব — চূড়ান্ত সিদ্ধান্তের আগে একজন আলেমের সাথে পরামর্শ করুন।</p>
          <p class="zakat-base">যাকাতযোগ্য মোট সম্পদ: <strong>${money(d.zakatBase)}</strong></p>
        </section>
      </div>
    `;
  } catch (err) {
    document.getElementById("dash-loading").textContent = "এরর: " + err.message;
  }
}


// ============================================================
// মাসিক বাজেট
// ============================================================
const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function monthOf(s) { return String(s || "").slice(0, 7); }
function round2(n) { return Math.round(n * 100) / 100; }
function parseAlloc(b) {
  try { const a = JSON.parse(b.allocations); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function monthLabel(m) {
  const [y, mm] = m.split("-");
  return (BN_MONTHS[Number(mm) - 1] || mm) + " " + y;
}

function renderBudgetView() {
  if (!state.budgetMonth) state.budgetMonth = todayStr().slice(0, 7);
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <div class="page-header">
      <h1>মাসিক বাজেট</h1>
      <p class="page-sub">বেতন/আয় এন্ট্রি করলে "বাজেট শতাংশ" অনুযায়ী ক্যাটেগরিতে ভাগ হয়ে যাবে। খরচ "ব্যয়" ট্যাবে ক্যাটেগরি বেছে এন্ট্রি করুন। অতিরিক্ত আয় যোগ করতে ধনাত্মক, কমাতে ঋণাত্মক (-) অংক দিন।</p>
    </div>
    <section class="panel form-panel">
      <h3>বাজেটে টাকা যোগ করুন</h3>
      <form id="budget-form" class="entry-form">
        <div class="field"><label for="b_date">তারিখ *</label><input type="date" id="b_date" required></div>
        <div class="field"><label for="b_amount">পরিমাণ (৳) *</label><input type="number" step="0.01" id="b_amount" required></div>
        <div class="field"><label for="b_note">নোট (যেমন: মাসিক বেতন, বোনাস)</label><input type="text" id="b_note"></div>
        <div class="field" style="grid-column:1/-1">
          <label><input type="checkbox" id="b_income" checked> একই সাথে "আয়" ট্যাবেও যোগ করুন (ধনাত্মক অংকে)</label>
        </div>
        <div class="form-actions"><button type="submit" class="btn-primary">বাজেটে যোগ করুন</button></div>
      </form>
    </section>
    <div class="month-bar">
      <label for="b_month">মাস দেখুন:</label>
      <input type="month" id="b_month">
    </div>
    <div id="budget-loading" class="loading">লোড হচ্ছে…</div>
    <div id="budget-body" class="hidden"></div>
  `;
  document.getElementById("b_date").value = todayStr();
  document.getElementById("b_month").value = state.budgetMonth;
  document.getElementById("b_month").addEventListener("change", (e) => {
    if (e.target.value) { state.budgetMonth = e.target.value; renderBudgetBody(); }
  });
  document.getElementById("budget-form").addEventListener("submit", submitBudgetEntry);
  loadBudget();
}

async function loadBudget() {
  const loading = document.getElementById("budget-loading");
  loading.classList.remove("hidden");
  try {
    const [plan, budgets, expenses] = await Promise.all([
      api.list("BudgetPlan"), api.list("MonthlyBudgets"), api.list("Expense")
    ]);
    plan.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    state.budgetData = { plan, budgets, expenses };
    loading.classList.add("hidden");
    renderBudgetBody();
  } catch (err) {
    loading.textContent = "এরর: " + err.message;
  }
}

async function submitBudgetEntry(e) {
  e.preventDefault();
  const d = state.budgetData;
  if (!d || !d.plan.length) { alert("প্রথমে 'বাজেট শতাংশ' ট্যাবে ক্যাটেগরি যোগ করুন।"); return; }
  const date = document.getElementById("b_date").value;
  const amount = Number(document.getElementById("b_amount").value);
  const note = document.getElementById("b_note").value;
  const addIncome = document.getElementById("b_income").checked;
  if (!date || !amount) return;

  const percentSum = d.plan.reduce((t, p) => t + (Number(p.percent) || 0), 0);
  if (Math.abs(percentSum - 100) > 0.001 &&
      !confirm("বাজেট শতাংশের মোট " + percentSum + "% (১০০% নয়)। তবুও চালিয়ে যাবেন?")) return;

  // এই মুহূর্তের শতাংশের স্ন্যাপশট — পরে শতাংশ বদলালেও এই এন্ট্রির বরাদ্দ অপরিবর্তিত থাকবে
  const alloc = d.plan.map(p => ({
    category: p.category,
    percent: Number(p.percent) || 0,
    amount: round2(amount * (Number(p.percent) || 0) / 100)
  }));
  if (Math.abs(percentSum - 100) <= 0.001) {
    const diff = round2(amount - alloc.reduce((t, a) => t + a.amount, 0));
    if (diff !== 0) {
      const biggest = alloc.reduce((m, a) => a.percent > m.percent ? a : m, alloc[0]);
      biggest.amount = round2(biggest.amount + diff);
    }
  }

  const btn = e.target.querySelector(".btn-primary");
  btn.disabled = true; btn.textContent = "সংরক্ষণ হচ্ছে…";
  try {
    await api.add("MonthlyBudgets", { date, amount, allocations: JSON.stringify(alloc), note });
    if (addIncome && amount > 0) {
      await api.add("Income", { date, category: "বেতন/আয় (বাজেট)", amount, note });
    }
    state.budgetMonth = monthOf(date);
    document.getElementById("b_month").value = state.budgetMonth;
    document.getElementById("b_amount").value = "";
    document.getElementById("b_note").value = "";
    await loadBudget();
  } catch (err) {
    alert("এরর: " + err.message);
  } finally {
    btn.disabled = false; btn.textContent = "বাজেটে যোগ করুন";
  }
}

function computeBudget(month, d) {
  const alloc = {}, spent = {};
  d.budgets.forEach(b => {
    const m = monthOf(b.date);
    alloc[m] = alloc[m] || {};
    parseAlloc(b).forEach(a => { alloc[m][a.category] = (alloc[m][a.category] || 0) + (Number(a.amount) || 0); });
  });
  d.expenses.forEach(x => {
    const m = monthOf(x.date);
    spent[m] = spent[m] || {};
    spent[m][x.category] = (spent[m][x.category] || 0) + (Number(x.amount) || 0);
  });
  const allocMonths = Object.keys(alloc).sort();
  const first = allocMonths[0]; // বাজেট শুরুর মাস — এর আগের খরচ জেরে ধরা হয় না
  const cats = d.plan.map(p => p.category);
  allocMonths.forEach(m => Object.keys(alloc[m]).forEach(c => { if (!cats.includes(c)) cats.push(c); }));
  const allMonths = [...new Set([...Object.keys(alloc), ...Object.keys(spent)])];

  const rows = cats.map(c => {
    let carry = 0;
    allMonths.forEach(m => {
      if (first && m >= first && m < month) carry += ((alloc[m] || {})[c] || 0) - ((spent[m] || {})[c] || 0);
    });
    const a = (alloc[month] || {})[c] || 0;
    const s = (spent[month] || {})[c] || 0;
    return { c, carry: round2(carry), a: round2(a), s: round2(s), rem: round2(a - s), total: round2(carry + a - s) };
  }).filter(r => d.plan.some(p => p.category === r.c) || r.carry || r.a || r.s);

  const unbudgeted = Object.keys(spent[month] || {})
    .filter(c => !cats.includes(c))
    .map(c => ({ c: c || "(খাত নেই)", s: round2(spent[month][c]) }));
  return { rows, unbudgeted, first };
}

function renderBudgetBody() {
  const d = state.budgetData;
  if (!d) return;
  const month = state.budgetMonth;
  const body = document.getElementById("budget-body");
  body.classList.remove("hidden");
  const { rows, unbudgeted, first } = computeBudget(month, d);
  const entries = d.budgets.filter(b => monthOf(b.date) === month)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const monthTotal = entries.reduce((t, b) => t + (Number(b.amount) || 0), 0);
  const totAlloc = rows.reduce((t, r) => t + r.a, 0);
  const totSpent = rows.reduce((t, r) => t + r.s, 0) + unbudgeted.reduce((t, r) => t + r.s, 0);
  const totCarry = rows.reduce((t, r) => t + r.carry, 0);
  const totBal = rows.reduce((t, r) => t + r.total, 0) - unbudgeted.reduce((t, r) => t + r.s, 0);
  const cls = n => n < 0 ? "neg" : "";
  const planSum = d.plan.reduce((t, p) => t + (Number(p.percent) || 0), 0);

  const tableRows = rows.map(r => {
    const pct = totAlloc ? (r.a / totAlloc * 100) : 0;
    const over = r.rem < 0 || r.total < 0;
    return `<tr>
      <td>${escapeHtml(r.c)}</td>
      <td>${totAlloc ? pct.toFixed(1) + "%" : "—"}</td>
      <td>${money(r.a)}</td>
      <td>${money(r.s)}</td>
      <td class="${cls(r.rem)}">${money(r.rem)}</td>
      <td class="${cls(r.carry)}">${money(r.carry)}</td>
      <td class="${cls(r.total)}"><strong>${money(r.total)}</strong>${over ? ' <span class="badge-over">বেশি খরচ</span>' : ""}</td>
    </tr>`;
  }).join("");
  const unbRows = unbudgeted.map(r => `<tr class="unbudgeted">
      <td>${escapeHtml(r.c)} <small>(বাজেট বহির্ভূত)</small></td><td>—</td><td>${money(0)}</td>
      <td>${money(r.s)}</td><td class="neg">${money(-r.s)}</td><td>—</td><td class="neg">${money(-r.s)}</td></tr>`).join("");

  body.innerHTML = `
    ${Math.abs(planSum - 100) > 0.001 ? `<p class="plan-warn">⚠ বাজেট শতাংশের মোট ${planSum}% — ১০০% হওয়া উচিত ("বাজেট শতাংশ" ট্যাব দেখুন)।</p>` : ""}
    <div class="stat-grid budget-stats">
      <div class="stat-card"><span class="stat-label">${monthLabel(month)} — মোট বরাদ্দ</span><span class="stat-value">${money(monthTotal)}</span></div>
      <div class="stat-card tax"><span class="stat-label">এ মাসের মোট খরচ</span><span class="stat-value">${money(totSpent)}</span></div>
      <div class="stat-card ${totBal < 0 ? "tax" : "zakat"}"><span class="stat-label">মোট ব্যালেন্স (জের সহ)</span><span class="stat-value ${cls(totBal)}">${money(totBal)}</span></div>
    </div>
    <section class="panel table-panel" style="margin-top:20px">
      <div class="table-scroll">
        <table>
          <thead><tr><th>ক্যাটেগরি</th><th>শতাংশ</th><th>বরাদ্দ</th><th>খরচ</th><th>এ মাসের বাকি</th><th>আগের জের</th><th>মোট ব্যালেন্স</th></tr></thead>
          <tbody>${tableRows || `<tr><td colspan="7" class="empty-row">এ মাসে এখনো কোনো বাজেট এন্ট্রি নেই</td></tr>`}${unbRows}
            <tr class="total-row"><td>মোট</td><td></td><td>${money(totAlloc)}</td><td>${money(totSpent)}</td><td class="${cls(totAlloc - totSpent)}">${money(totAlloc - totSpent)}</td><td class="${cls(totCarry)}">${money(totCarry)}</td><td class="${cls(totBal)}">${money(totBal)}</td></tr>
          </tbody>
        </table>
      </div>
      <p class="plan-total">"আগের জের" = বাজেট শুরুর মাস${first ? " (" + monthLabel(first) + ")" : ""} থেকে আগের মাসগুলোর বাকি/ঋণাত্মক ব্যালেন্সের যোগফল। শতাংশ বদলালেও আগের মাসের বরাদ্দ অপরিবর্তিত থাকে।</p>
    </section>
    <section class="panel table-panel" style="margin-top:20px">
      <div class="table-scroll">
        <table>
          <thead><tr><th>তারিখ</th><th>পরিমাণ</th><th>নোট</th><th>ভাগের স্ন্যাপশট</th><th class="actions-col">কার্যক্রম</th></tr></thead>
          <tbody>${entries.map(b => `<tr>
            <td>${escapeHtml(String(b.date))}</td>
            <td class="${cls(Number(b.amount))}">${money(b.amount)}</td>
            <td>${escapeHtml(String(b.note || ""))}</td>
            <td><small>${parseAlloc(b).map(a => escapeHtml(a.category) + " " + a.percent + "%").join(" · ")}</small></td>
            <td class="actions-col"><button class="icon-btn delete-btn" data-id="${b.id}" title="মুছুন">✕</button></td>
          </tr>`).join("") || `<tr><td colspan="5" class="empty-row">এ মাসে কোনো এন্ট্রি নেই</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
  body.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("এই বাজেট এন্ট্রি মুছবেন? (\"আয়\" ট্যাবে যোগ হওয়া এন্ট্রি আলাদাভাবে থাকবে)")) return;
      try { await api.remove("MonthlyBudgets", btn.dataset.id); await loadBudget(); }
      catch (err) { alert("এরর: " + err.message); }
    });
  });
}

// ============================================================
// কর সেটিংস (করমুক্ত সীমা ও ন্যূনতম কর)
// ============================================================
async function renderTaxSettingsView() {
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <div class="page-header">
      <h1>কর সেটিংস</h1>
      <p class="page-sub">করমুক্ত আয়সীমা ও ন্যূনতম কর এখান থেকে বদলান। স্ল্যাবের হার বদলাতে "আয়কর স্ল্যাব" ট্যাবে যান।</p>
    </div>
    <div id="ts-loading" class="loading">লোড হচ্ছে…</div>
    <section class="panel form-panel hidden" id="ts-panel">
      <form id="ts-form" class="entry-form">
        <div class="field">
          <label for="ts_exemption">করমুক্ত আয়সীমা (৳) *</label>
          <input type="number" step="1" id="ts_exemption" required>
        </div>
        <div class="field">
          <label for="ts_minimum">ন্যূনতম কর (৳) *</label>
          <input type="number" step="1" id="ts_minimum" required>
        </div>
        <div class="form-actions"><button type="submit" class="btn-primary">সংরক্ষণ করুন</button></div>
      </form>
      <div class="note-panel" style="margin-top:20px">
        <h3>করবর্ষ ২০২৬-২৭ ও ২০২৭-২৮ এর করমুক্ত সীমা (আয়কর আইন ২০২৩)</h3>
        <div class="mini-row"><span>সাধারণ করদাতা / অনিবাসী বাংলাদেশী</span><span>৳3,75,000</span></div>
        <div class="mini-row"><span>নারী ও ৬৫+ বছর বয়সী</span><span>৳4,25,000</span></div>
        <div class="mini-row"><span>তৃতীয় লিঙ্গ ও প্রতিবন্ধী</span><span>৳5,00,000</span></div>
        <div class="mini-row"><span>গেজেটভুক্ত যুদ্ধাহত মুক্তিযোদ্ধা / জুলাই যোদ্ধা</span><span>৳5,25,000</span></div>
        <p>প্রতিবন্ধী সন্তানের জন্য অতিরিক্ত ৳50,000 প্রযোজ্য হলে সেটা যোগ করে লিখুন। উপরের অংকগুলো প্রকাশিত তথ্যের ভিত্তিতে — সর্বশেষ আইন NBR থেকে যাচাই করে নিন।</p>
      </div>
    </section>
  `;
  try {
    const rows = await api.list("TaxSettings");
    const st = rows.find(r => r.id === "settings") || {};
    document.getElementById("ts_exemption").value = st.exemptionAmount !== undefined && st.exemptionAmount !== "" ? st.exemptionAmount : 375000;
    document.getElementById("ts_minimum").value = st.minimumTax !== undefined && st.minimumTax !== "" ? st.minimumTax : 5000;
    document.getElementById("ts-loading").classList.add("hidden");
    document.getElementById("ts-panel").classList.remove("hidden");
    document.getElementById("ts-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector(".btn-primary");
      btn.disabled = true; btn.textContent = "সংরক্ষণ হচ্ছে…";
      try {
        await api.update("TaxSettings", {
          id: "settings",
          exemptionAmount: document.getElementById("ts_exemption").value,
          minimumTax: document.getElementById("ts_minimum").value
        });
        alert("সংরক্ষণ হয়েছে");
      } catch (err) { alert("এরর: " + err.message); }
      btn.disabled = false; btn.textContent = "সংরক্ষণ করুন";
    });
  } catch (err) {
    document.getElementById("ts-loading").textContent = "এরর: " + err.message;
  }
}

// ============================================================
// মডিউল ভিউ (ফর্ম + টেবিল)
// ============================================================
function renderModuleView(key) {
  const mod = MODULES[key];
  state.refCache = {};      // প্রতিবার ট্যাব খুললে রেফারেন্স তালিকা নতুন করে আনা হবে
  state.editingId = null;   // অন্য ট্যাবের অসমাপ্ত এডিট যেন নতুন এন্ট্রিকে আপডেট না বানায়
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <div class="page-header">
      <h1>${mod.label}</h1>
      ${mod.helpText ? `<p class="page-sub">${mod.helpText}</p>` : ""}
    </div>
    <section class="panel form-panel">
      <h3 id="form-title">নতুন এন্ট্রি যোগ করুন</h3>
      <form id="entry-form" class="entry-form"></form>
    </section>
    <div id="module-summary"></div>
    <section class="panel table-panel">
      <div class="table-scroll">
        <table id="entry-table"><thead></thead><tbody></tbody></table>
      </div>
      <div id="table-loading" class="loading">লোড হচ্ছে…</div>
    </section>
  `;
  buildForm(key);
}

async function buildForm(key) {
  const mod = MODULES[key];
  const form = document.getElementById("entry-form");
  form.innerHTML = "";

  for (const field of mod.fields) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.textContent = field.label + (field.required ? " *" : "");
    label.htmlFor = "f_" + field.key;
    wrap.appendChild(label);

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      input.appendChild(new Option("বেছে নিন", ""));
      field.options.forEach(o => input.appendChild(new Option(o.label, o.value)));
    } else if (field.type === "budgetcat") {
      input = document.createElement("select");
      input.appendChild(new Option("বেছে নিন", ""));
      const plan = (await getRefRows("BudgetPlan")).slice()
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      plan.forEach(r => input.appendChild(new Option(r.category, r.category)));
    } else if (field.type === "ref") {
      input = document.createElement("select");
      input.appendChild(new Option("বেছে নিন", ""));
      const rows = await getRefRows(field.refSheet);
      rows.forEach(r => input.appendChild(new Option(field.refLabel(r), r.id)));
      if (rows.length === 0) {
        const hint = document.createElement("div");
        hint.className = "field-hint";
        hint.textContent = `প্রথমে "${MODULES[field.refSheet].label}" ট্যাব থেকে একটি অ্যাকাউন্ট যোগ করুন।`;
        wrap.appendChild(hint);
      }
    } else if (field.type === "text" && field.long) {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = field.type;
      if (field.type === "number") { input.step = "0.01"; }
    }
    input.id = "f_" + field.key;
    input.name = field.key;
    if (field.suggest) {
      input.setAttribute("list", "dl_" + field.key);
      const dl = document.createElement("datalist");
      dl.id = "dl_" + field.key;
      wrap.appendChild(dl);
    }
    if (field.required) input.required = true;
    wrap.appendChild(input);
    form.appendChild(wrap);
  }

  const actions = document.createElement("div");
  actions.className = "form-actions";
  actions.innerHTML = `
    <button type="submit" class="btn-primary">সংরক্ষণ করুন</button>
    <button type="button" id="cancel-edit" class="btn-secondary hidden">বাতিল</button>
  `;
  form.appendChild(actions);

  form.addEventListener("submit", (e) => submitForm(e, key));
  document.getElementById("cancel-edit").addEventListener("click", () => resetForm(key));
}

async function getRefRows(sheet) {
  if (!state.refCache[sheet]) {
    state.refCache[sheet] = api.list(sheet); // Promise cache — একই শিটের দুটো রিকোয়েস্ট একসাথে হয় না
  }
  return state.refCache[sheet];
}

function resetForm(key) {
  state.editingId = null;
  document.getElementById("entry-form").reset();
  document.getElementById("form-title").textContent = "নতুন এন্ট্রি যোগ করুন";
  document.getElementById("cancel-edit").classList.add("hidden");
}

async function submitForm(e, key) {
  e.preventDefault();
  const mod = MODULES[key];
  const form = e.target;
  const data = {};
  mod.fields.forEach(f => { data[f.key] = document.getElementById("f_" + f.key).value; });

  const submitBtn = form.querySelector(".btn-primary");
  submitBtn.disabled = true;
  submitBtn.textContent = "সংরক্ষণ হচ্ছে…";
  try {
    if (state.editingId) {
      data.id = state.editingId;
      await api.update(key, data);
    } else {
      await api.add(key, data);
    }
    resetForm(key);
    await loadModule(key);
  } catch (err) {
    alert("এরর: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "সংরক্ষণ করুন";
  }
}

async function loadModule(key) {
  state.currentSheet = key;
  const mod = MODULES[key];
  const loadingEl = document.getElementById("table-loading");
  loadingEl.classList.remove("hidden");
  try {
    const rows = await api.list(key);
    let refLookups = {};
    for (const f of mod.fields) {
      if (f.type === "ref") {
        const refRows = await getRefRows(f.refSheet);
        refLookups[f.key] = {};
        refRows.forEach(r => { refLookups[f.key][r.id] = f.refLabel(r); });
      }
    }
    renderTable(key, rows, refLookups);
    loadingEl.classList.add("hidden");
    renderModuleSummary(key, rows);
    mod.fields.filter(f => f.suggest).forEach(f => {
      const dl = document.getElementById("dl_" + f.key);
      if (dl) dl.innerHTML = [...new Set(rows.map(r => String(r[f.key] || "").trim()).filter(Boolean))]
        .map(v => `<option value="${escapeHtml(v)}"></option>`).join("");
    });
    if (key === "BudgetPlan") {
      const total = rows.reduce((t, r) => t + (Number(r.percent) || 0), 0);
      let el = document.getElementById("plan-total");
      if (!el) {
        el = document.createElement("p");
        el.id = "plan-total";
        el.className = "plan-total";
        document.querySelector(".table-panel").appendChild(el);
      }
      el.textContent = "মোট শতাংশ: " + total + "%" + (Math.abs(total - 100) > 0.001 ? " — ⚠ মোট ১০০% হওয়া উচিত" : " ✓");
      el.classList.toggle("neg", Math.abs(total - 100) > 0.001);
    }
  } catch (err) {
    loadingEl.textContent = "এরর: " + err.message;
  }
}


// অন্যের আমানত (নাম অনুযায়ী) ও সম্পদের সারসংক্ষেপ
function renderModuleSummary(key, rows) {
  const box = document.getElementById("module-summary");
  if (!box) return;
  const cls = n => n < 0 ? "neg" : "";
  if (key === "Deposits") {
    const map = {};
    rows.forEach(r => {
      const n = String(r.name || "").trim() || "(নাম নেই)";
      const o = map[n] = map[n] || { name: n, deposit: 0, withdraw: 0, spent: 0 };
      o[r.type] = (o[r.type] || 0) + (Number(r.amount) || 0);
    });
    const list = Object.values(map).map(o => ({ ...o, balance: o.deposit - o.withdraw - o.spent }));
    const total = list.reduce((t, o) => t + o.balance, 0);
    box.innerHTML = `<section class="panel table-panel" style="margin-bottom:26px">
      <h3 style="padding:16px 22px 0;border:none">কার কত টাকা আমার কাছে আছে</h3>
      <div class="table-scroll"><table>
        <thead><tr><th>নাম</th><th>মোট জমা</th><th>ফেরত নিয়েছেন</th><th>আমি খরচ করেছি</th><th>সর্বশেষ আমার কাছে আছে</th></tr></thead>
        <tbody>${list.map(o => `<tr><td>${escapeHtml(o.name)}</td><td>${money(o.deposit)}</td><td>${money(o.withdraw)}</td><td>${money(o.spent)}</td><td class="${cls(o.balance)}"><strong>${money(o.balance)}</strong></td></tr>`).join("")
          || `<tr><td colspan="5" class="empty-row">এখনো কারো আমানত নেই</td></tr>`}
        <tr class="total-row"><td>সবার মোট</td><td></td><td></td><td></td><td class="${cls(total)}">${money(total)}</td></tr></tbody>
      </table></div></section>`;
  } else if (key === "Assets") {
    const act = rows.filter(r => r.status !== "sold");
    const cost = act.reduce((t, r) => t + (Number(r.amount) || 0), 0);
    const val = act.reduce((t, r) => t + assetValue(r), 0);
    box.innerHTML = `<div class="stat-grid budget-stats" style="margin-bottom:26px">
      <div class="stat-card"><span class="stat-label">মোট ক্রয়মূল্য (বিদ্যমান সম্পদ)</span><span class="stat-value">${money(cost)}</span></div>
      <div class="stat-card tax"><span class="stat-label">মোট অবচয়</span><span class="stat-value">${money(cost - val)}</span></div>
      <div class="stat-card zakat"><span class="stat-label">বর্তমান মূল্য</span><span class="stat-value">${money(val)}</span></div></div>`;
  } else {
    box.innerHTML = "";
  }
}

function displayValue(field, row, refLookups) {
  const raw = row[field.key];
  if (field.type === "select") {
    const opt = field.options.find(o => o.value === raw);
    return opt ? opt.label : (raw || "");
  }
  if (field.type === "ref") {
    return (refLookups[field.key] && refLookups[field.key][raw]) || raw || "";
  }
  if (field.type === "number") {
    if (raw === "" || raw === null || raw === undefined) return "";
    if (field.percent) return raw + "%";
    if (field.plain) return raw;
    return money(raw);
  }
  return raw || "";
}

function renderTable(key, rows, refLookups) {
  const mod = MODULES[key];
  const table = document.getElementById("entry-table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  const extra = mod.extraColumns || [];
  thead.innerHTML = "<tr>" + mod.fields.map(f => `<th>${f.label.split(" — ")[0]}</th>`).join("")
    + extra.map(c => `<th>${c.label}</th>`).join("") + "<th class='actions-col'>কার্যক্রম</th></tr>";

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${mod.fields.length + extra.length + 1}" class="empty-row">এখনো কোনো এন্ট্রি নেই — উপরের ফর্ম দিয়ে যোগ করুন</td></tr>`;
    return;
  }

  // date থাকলে সাম্প্রতিক আগে দেখাই
  const sorted = [...rows].sort((a, b) => {
    if (key === "TaxSlabs") return (Number(a.order) || 0) - (Number(b.order) || 0);
    if (a.date && b.date) return new Date(b.date) - new Date(a.date);
    return 0;
  });

  tbody.innerHTML = sorted.map(row => {
    const cells = mod.fields.map(f => `<td>${escapeHtml(String(displayValue(f, row, refLookups)))}</td>`).join("")
      + extra.map(c => `<td>${escapeHtml(String(c.compute(row)))}</td>`).join("");
    return `<tr>
      ${cells}
      <td class="actions-col">
        <button class="icon-btn edit-btn" data-id="${row.id}" title="সম্পাদনা করুন">✎</button>
        <button class="icon-btn delete-btn" data-id="${row.id}" title="মুছুন">✕</button>
      </td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => startEdit(key, btn.dataset.id, rows));
  });
  tbody.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteEntry(key, btn.dataset.id));
  });
}

function startEdit(key, id, rows) {
  const row = rows.find(r => String(r.id) === String(id));
  if (!row) return;
  const mod = MODULES[key];
  state.editingId = id;
  mod.fields.forEach(f => {
    const el = document.getElementById("f_" + f.key);
    if (el) {
      const val = row[f.key] === undefined || row[f.key] === null ? "" : row[f.key];
      if (el.tagName === "SELECT" && val !== "" && ![...el.options].some(o => o.value === String(val))) {
        el.appendChild(new Option(String(val), String(val)));
      }
      el.value = val;
    }
  });
  document.getElementById("form-title").textContent = "এন্ট্রি সম্পাদনা করুন";
  document.getElementById("cancel-edit").classList.remove("hidden");
  document.getElementById("entry-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteEntry(key, id) {
  if (!confirm("আপনি কি নিশ্চিত এই এন্ট্রিটি মুছে ফেলতে চান?")) return;
  try {
    await api.remove(key, id);
    await loadModule(key);
  } catch (err) {
    alert("এরর: " + err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// শুরু (auth.js থেকে সফল লগইনের পর ডাকা হয়)
// ============================================================
function initApp() {
  buildNav();
  selectTab("dashboard");

  const menuBtn = document.getElementById("menu-toggle");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });
  }
  document.getElementById("sidebar-nav").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("লগ আউট করলে আবার পাসওয়ার্ড দিতে হবে। আগাবেন?")) logout();
    });
  }
}
