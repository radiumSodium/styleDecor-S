const initFirebase = require("../config/firebase");
const admin = initFirebase();

module.exports = async function verifyFirebase(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, message: "No token" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded; // { uid, email, name... }
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Invalid Firebase token" });
  }
};