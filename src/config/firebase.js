const admin = require("firebase-admin");

function initFirebase() {
  try {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!b64) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");

    const json = Buffer.from(b64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(json);

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    return admin;
  } catch (e) {
    console.error("❌ Firebase Admin init error:", e.message);
    throw e;
  }
}

module.exports = initFirebase;