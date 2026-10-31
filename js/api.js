// Google Apps Script এর সাথে যোগাযোগ করার সহায়ক ফাংশনগুলো।
// CORS জটিলতা এড়াতে সবসময় GET রিকোয়েস্ট ব্যবহার করা হয়েছে।

async function apiCall(params) {
  if (!SCRIPT_URL || SCRIPT_URL.indexOf("PASTE_YOUR") === 0) {
    throw new Error("config.js ফাইলে আপনার Apps Script URL বসান।");
  }
  const url = new URL(SCRIPT_URL);
  Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
  const token = (typeof getAuthToken === "function") ? getAuthToken() : "";
  if (token) {
    url.searchParams.set("token", token);
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "অজানা এরর হয়েছে");
  return json.data;
}

const api = {
  dashboard: () => apiCall({ action: "dashboard" }),
  list: (sheet) => apiCall({ action: "list", sheet }),
  add: (sheet, data) => apiCall({ action: "add", sheet, data: JSON.stringify(data) }),
  update: (sheet, data) => apiCall({ action: "update", sheet, data: JSON.stringify(data) }),
  remove: (sheet, id) => apiCall({ action: "delete", sheet, id })
};
