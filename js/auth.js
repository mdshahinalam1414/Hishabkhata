// ============================================================
// পাসওয়ার্ড লক স্ক্রিন
// পাসওয়ার্ড = Apps Script এ সেট করা API_TOKEN (README.md এর ধাপ ৩ দেখুন)
// এই পাসওয়ার্ড কখনোই গিটহাবের কোডে লেখা থাকে না — শুধু ভিজিটরের ব্রাউজারে
// localStorage-এ সংরক্ষিত থাকে, নিজের ডিভাইসে টাইপ করার পর।
// ============================================================

const AUTH_STORAGE_KEY = "hisab_khata_token";
let currentToken = "";

function getAuthToken() {
  return currentToken;
}

function getStoredToken() {
  try { return localStorage.getItem(AUTH_STORAGE_KEY) || ""; }
  catch (e) { return ""; }
}

function setStoredToken(token) {
  try { localStorage.setItem(AUTH_STORAGE_KEY, token); }
  catch (e) { /* localStorage বন্ধ থাকলে চুপচাপ এড়িয়ে যাওয়া হলো */ }
}

function clearStoredToken() {
  try { localStorage.removeItem(AUTH_STORAGE_KEY); }
  catch (e) { /* ignore */ }
}

async function verifyToken(token) {
  currentToken = token;
  try {
    await apiCall({ action: "meta" });
    return true;
  } catch (err) {
    currentToken = "";
    return false;
  }
}

function showLockScreen(message) {
  document.getElementById("app-shell").classList.add("hidden");
  const lock = document.getElementById("lock-screen");
  lock.classList.remove("hidden");
  const errorEl = document.getElementById("lock-error");
  errorEl.textContent = message || "";
  errorEl.classList.toggle("hidden", !message);
  const input = document.getElementById("lock-password");
  input.value = "";
  setTimeout(() => input.focus(), 50);
}

function hideLockScreen() {
  document.getElementById("lock-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");
}

async function handleLockSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("lock-password");
  const btn = document.getElementById("lock-submit");
  const password = input.value.trim();
  btn.disabled = true;
  btn.textContent = "যাচাই হচ্ছে…";
  const ok = await verifyToken(password);
  btn.disabled = false;
  btn.textContent = "খাতা খুলুন";
  if (ok) {
    setStoredToken(password);
    hideLockScreen();
    if (typeof initApp === "function") initApp();
  } else {
    showLockScreen("পাসওয়ার্ড সঠিক নয়, অথবা config.js এ SCRIPT_URL বসানো হয়নি। আবার চেষ্টা করুন।");
  }
}

function logout() {
  clearStoredToken();
  currentToken = "";
  location.reload();
}

async function initAuth() {
  document.getElementById("lock-form").addEventListener("submit", handleLockSubmit);

  const stored = getStoredToken();
  if (stored) {
    const ok = await verifyToken(stored);
    if (ok) {
      hideLockScreen();
      if (typeof initApp === "function") initApp();
      return;
    }
    clearStoredToken();
  }
  showLockScreen();
}

document.addEventListener("DOMContentLoaded", initAuth);
