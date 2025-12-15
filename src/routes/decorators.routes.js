const router = require("express").Router();
const DecoratorProfile = require("../models/DecoratorProfile");
const user = require("../models/user");


// Public: top decorators
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);

  const profiles = await DecoratorProfile.find({ active: true })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();

  const userIds = profiles.map((p) => p.userId);
  const users = await user.find({ _id: { $in: userIds } })
    .select("name email photoURL role")
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const data = profiles.map((p) => {
    const u = userMap.get(p.userId.toString());
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
});

module.exports = router;