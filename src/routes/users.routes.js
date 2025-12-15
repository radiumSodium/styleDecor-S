const router = require("express").Router();
const requireJWT = require("../middlewares/requireJWT");
const requireRole = require("../middlewares/requireRole");
const user = require("../models/user");

router.get("/me", requireJWT, async (req, res) => {
  const user = await user.findById(req.user._id).select("-__v");
  res.json({ ok: true, user });
});

// admin assigns role decorator/admin
router.patch("/:id/role", requireJWT, requireRole("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin", "decorator"].includes(role))
    return res.status(400).json({ ok: false, message: "Invalid role" });

  const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json({ ok: true, user: updated });
});

module.exports = router;