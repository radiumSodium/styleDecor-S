const router = require("express").Router();
const Service = require("../models/Service");
const requireJWT = require("../middlewares/requireJWT");
const requireRole = require("../middlewares/requireRole");

// PUBLIC: get all services
router.get("/", async (req, res) => {
  try {
    const list = await Service.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error("GET /api/services error:", e);
    res.status(500).json({ ok: false, message: "Failed to load services" });
  }
});

// ✅ PUBLIC: get single service by id (Service Details)
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ ok: false, message: "Service not found" });
    }

    res.json({ ok: true, data: service });
  } catch (e) {
    return res.status(400).json({ ok: false, message: "Invalid service id" });
  }
});

// ADMIN: update service
router.patch("/:id", requireJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const allowed = [
      "title",
      "serviceTitle",
      "price",
      "category",
      "type",
      "image",
      "description",
    ];
    const update = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (update.price !== undefined) update.price = Number(update.price) || 0;

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ ok: false, message: "Service not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("PATCH /api/services/:id error:", e);
    res.status(500).json({ ok: false, message: "Failed to update service" });
  }
});

// ADMIN: delete service
router.delete("/:id", requireJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Service not found" });
    }

    res.json({ ok: true, data: deleted });
  } catch (e) {
    console.error("DELETE /api/services/:id error:", e);
    res.status(500).json({ ok: false, message: "Failed to delete service" });
  }
});

module.exports = router;
