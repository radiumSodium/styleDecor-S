const router = require("express").Router();
const Service = require("../models/Service");
const requireJWT = require("../middlewares/requireJWT");
const requireRole = require("../middlewares/requireRole");

// Public: list services (home/services page)
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 0, 50);

  const query = { active: true };
  const cursor = Service.find(query).sort({ createdAt: -1 });
  if (limit) cursor.limit(limit);

  const services = await cursor;
  res.json({ ok: true, data: services });
});

// Public: single service
router.get("/:id", async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ ok: false, message: "Not found" });
  res.json({ ok: true, data: service });
});

// Admin/Decorator: create service
router.post("/", requireJWT, requireRole("admin", "decorator"), async (req, res) => {
  const payload = req.body;

  const created = await Service.create({
    title: payload.title,
    category: payload.category,
    type: payload.type || "both",
    price: payload.price,
    durationMins: payload.durationMins || 60,
    description: payload.description || "",
    image: payload.image || "",
    tags: payload.tags || [],
    active: payload.active ?? true,
    createdBy: req.user._id,
  });

  res.status(201).json({ ok: true, data: created });
});

module.exports = router;