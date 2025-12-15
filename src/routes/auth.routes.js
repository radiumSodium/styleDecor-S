const router = require("express").Router();
const jwt = require("jsonwebtoken");
const verifyFirebase = require("../middlewares/verifyFirebase");
const user = require("../models/user");


router.post("/session", verifyFirebase, async (req, res) => {
  const fb = req.firebaseUser;
  const email = fb.email;
  const uid = fb.uid;

  if (!email) return res.status(400).json({ ok: false, message: "No email in token" });

  const update = {
    uid,
    email,
    name: fb.name || fb.email?.split("@")[0] || "",
    photoURL: fb.picture || "",
  };

  const user = await user.findOneAndUpdate(
    { uid },
    { $set: update, $setOnInsert: { role: "user" } },
    { new: true, upsert: true }
  );

  const token = jwt.sign(
    { _id: user._id.toString(), uid: user.uid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ ok: true, token, user });
});

module.exports = router;