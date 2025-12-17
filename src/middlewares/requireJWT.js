const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function requireJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ ok: false, message: "No JWT token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const dbUser = await User.findOne({
      $or: [
        payload._id ? { _id: payload._id } : null,
        payload.email ? { email: payload.email } : null,
        payload.uid ? { uid: payload.uid } : null,
      ].filter(Boolean),
    });

    if (!dbUser) {
      return res.status(401).json({
        ok: false,
        message: "User not found in database",
      });
    }

    // attach clean, trusted user object
    req.user = {
      _id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      uid: dbUser.uid,
    };

    next();
  } catch (e) {
    console.error("requireJWT error:", e.message);
    return res
      .status(401)
      .json({ ok: false, message: "Invalid or expired JWT" });
  }
};
