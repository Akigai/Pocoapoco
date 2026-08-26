// Sent by the scheduled GitHub Action. Reads subscriptions.json and pushes
// the morning or evening reminder depending on the time of day (UTC).
const webpush = require("web-push");
const fs = require("fs");

const VAPID_PUBLIC_KEY = "BNaW9GBoJh4Fe6EHr_81DYy-B803ag8JkWxIKvk9WSTVZbfz6RgaDHtq7zaEv4fH1mfl60tE9R0gFCXLr1GYexk";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PRIVATE_KEY) {
  console.error("VAPID_PRIVATE_KEY secret is not set. Add it in Settings > Secrets and variables > Actions.");
  process.exit(1);
}

webpush.setVapidDetails("mailto:michaelmossman7@gmail.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const subs = JSON.parse(fs.readFileSync("./subscriptions.json", "utf8"));
if (!Array.isArray(subs) || subs.length === 0) {
  console.log("No subscriptions in subscriptions.json yet - nothing to send.");
  process.exit(0);
}

const isMorning = new Date().getUTCHours() < 12;
const payload = JSON.stringify(
  isMorning
    ? { title: "Diario de la mañana", body: "Un párrafo con el café. നിന്റെ streak കാത്തിരിക്കുന്നു!" }
    : { title: "Diario de la noche", body: "രാത്രി ഡയറി + Corrección con Claude. ¡Poco a poco!" }
);

(async () => {
  let ok = 0, gone = 0, failed = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
      ok++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        gone++;
        console.log("A subscription has expired - remove it from subscriptions.json.");
      } else {
        failed++;
        console.log("Send failed:", err.statusCode || err.message);
      }
    }
  }
  console.log(`Done. Sent: ${ok}, expired: ${gone}, failed: ${failed}.`);
})();
