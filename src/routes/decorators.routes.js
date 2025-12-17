const router = require("express").Router();
const DecoratorProfile = require("../models/DecoratorProfile");
const User = require("../models/User");

// Public: top decorators
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);

    const profiles = await DecoratorProfile.find({ active: true })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    if (!profiles.length) {
      return res.json({ ok: true, data: [] });
    }

    // filter out invalid userId just in case
    const userIds = profiles.map((p) => p.userId).filter(Boolean);

    const users = await User.find({ _id: { $in: userIds } })
      .select("name email photoURL role")
      .lean();

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const data = profiles.map((p) => {
      const u = p.userId ? userMap.get(String(p.userId)) : null;

      return {
        _id: p._id,
        name: u?.name || "Decorator",
        photoURL: u?.photoURL || "",
        rating: p.rating,
        specialty: p.specialty,
        tags: p.tags || [],
      };
    });

    res.json({ ok: true, data });
  } catch (e) {
    console.error("GET /api/decorators error:", e);
    res.status(500).json({ ok: false, message: "Failed to load decorators" });
  }
});

module.exports = router;
