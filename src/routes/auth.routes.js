const router = require("express").Router();
const jwt = require("jsonwebtoken");
const verifyFirebase = require("../middlewares/verifyFirebase");
const User = require("../models/User");

router.post("/session", verifyFirebase, async (req, res) => {
  try {
    const fb = req.firebaseUser; // decoded firebase token
    const uid = fb.uid;
    const email = fb.email;

    if (!email) {
      return res
        .status(400)
        .json({ ok: false, message: "Firebase token has no email" });
    }

    const update = {
      uid,
      email,
      name: fb.name || email.split("@")[0],
      photoURL: fb.picture || "",
    };

    const dbUser = await User.findOneAndUpdate(
      { uid },
      { $set: update, $setOnInsert: { role: "user" } },
      { new: true, upsert: true }
    );

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ ok: false, message: "Missing JWT_SECRET" });
    }

    const token = jwt.sign(
      {
        _id: dbUser._id.toString(),
        uid: dbUser.uid,
        email: dbUser.email,
        role: dbUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ ok: true, token, user: dbUser });
  } catch (err) {
    console.error("❌ /api/auth/session error:", err);
    return res.status(500).json({ ok: false, message: "Session failed" });
  }
});

module.exports = router;
