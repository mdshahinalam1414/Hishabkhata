// এখানে আপনার Google Apps Script ডিপ্লয় করার পর যে ওয়েব অ্যাপ URL পাবেন সেটা বসান।
// README.md ফাইলে ধাপে ধাপে দেখানো আছে কীভাবে এই URL পাবেন।
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCcRl0Bbavsigxps_1pftGDsjkqyz87K_LSARFD07u5TCF-3vblZpjaZiF5Jg0fXSTpQ/exec";

// লক্ষ্য করুন: এখানে কোনো পাসওয়ার্ড/টোকেন বসানোর দরকার নেই।
// সাইট খোলার সময় ভিজিটরকে পাসওয়ার্ড জিজ্ঞেস করা হবে (js/auth.js দেখুন), এবং সেই
// পাসওয়ার্ডটি শুধু ভিজিটরের নিজের ব্রাউজারে সংরক্ষিত থাকবে — গিটহাবের পাবলিক কোডে নয়।
// পাসওয়ার্ড সেট হয় Apps Script এর Script Properties এ API_TOKEN হিসেবে (README.md দেখুন)।
