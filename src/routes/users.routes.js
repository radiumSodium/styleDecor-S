const router = require("express").Router();
const User = require("../models/User");
const requireJWT = require("../middlewares/requireJWT");
const requireRole = require("../middlewares/requireRole");

// ADMIN: get all users (optional role filter)
router.get("/", requireJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};

    const list = await User.find(query).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error("GET /api/users error:", e);
    res.status(500).json({ ok: false, message: "Failed to load users" });
  }
});

// ADMIN: update a user's role
router.patch(
  "/:id/role",
  requireJWT,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      const allowed = ["user", "decorator", "admin"];

      if (!allowed.includes(role)) {
        return res.status(400).json({ ok: false, message: "Invalid role" });
      }

      // Optional safety: prevent admin from demoting themselves accidentally
      if (req.user._id === req.params.id && role !== "admin") {
        return res.status(400).json({
          ok: false,
          message: "You cannot remove your own admin role",
        });
      }

      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { role } },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ ok: false, message: "User not found" });
      }

      res.json({ ok: true, data: updated });
    } catch (e) {
      console.error("PATCH /api/users/:id/role error:", e);
      res.status(500).json({ ok: false, message: "Failed to update role" });
    }
  }
);

module.exports = router;
