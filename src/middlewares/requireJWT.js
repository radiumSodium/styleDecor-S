// const jwt = require("jsonwebtoken");

// module.exports = function requireJWT(req, res, next) {
//   try {
//     const auth = req.headers.authorization || "";
//     const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//     if (!token) return res.status(401).json({ ok: false, message: "No JWT" });

//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = payload; // { _id, uid, email, role }
//     next();
//   } catch (e) {
//     return res.status(401).json({ ok: false, message: "Invalid JWT" });
//   }
// };

const jwt = require("jsonwebtoken");
const user = require("../models/user");

module.exports = async function requireJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ ok: false, message: "No JWT token" });
    }

    // verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload may contain: uid, email, role, _id (don’t trust blindly)

    // ALWAYS fetch DB user
    const dbUser = await user.findOne({
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
