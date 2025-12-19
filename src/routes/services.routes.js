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

// PUBLIC: get single service by id (Service Details)
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

// ADMIN + DECORATOR: create new service
router.post(
  "/",
  requireJWT,
  requireRole(["admin", "decorator"]),
  async (req, res) => {
    try {
      const {
        title,
        price,
        category = "home",
        type = "both",
        image = "",
        description = "",
        tags = [],
        active = true,
        durationMins = 60,
      } = req.body;

      if (!title?.trim()) {
        return res
          .status(400)
          .json({ ok: false, message: "Title is required" });
      }

      const doc = await Service.create({
        title: title.trim(),
        price: Number(price) || 0,
        category,
        type,
        image,
        description,
        tags: Array.isArray(tags) ? tags : [],
        active: Boolean(active),
        durationMins: Number(durationMins) || 60,

        // IMPORTANT: must be DB user ObjectId
        createdBy: req.user?._id || null,
      });

      res.status(201).json({ ok: true, data: doc });
    } catch (e) {
      console.error("POST /api/services error:", e);
      res.status(500).json({ ok: false, message: "Failed to create service" });
    }
  }
);

router.patch(
  "/:id",
  requireJWT,
  requireRole(["admin", "decorator"]),
  async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res
          .status(404)
          .json({ ok: false, message: "Service not found" });
      }

      // decorator can only edit own
      if (req.user.role === "decorator") {
        if (String(service.createdBy || "") !== String(req.user._id)) {
          return res.status(403).json({ ok: false, message: "Forbidden" });
        }
      }

      const allowed = [
        "title",
        "price",
        "category",
        "type",
        "image",
        "description",
        "tags",
        "active",
        "durationMins",
      ];

      for (const key of allowed) {
        if (req.body[key] !== undefined) service[key] = req.body[key];
      }

      if (req.body.price !== undefined)
        service.price = Number(req.body.price) || 0;
      if (req.body.durationMins !== undefined)
        service.durationMins = Number(req.body.durationMins) || 60;

      await service.save();

      res.json({ ok: true, data: service });
    } catch (e) {
      console.error("PATCH /api/services/:id error:", e);
      res.status(500).json({ ok: false, message: "Failed to update service" });
    }
  }
);

router.delete(
  "/:id",
  requireJWT,
  requireRole(["admin", "decorator"]),
  async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res
          .status(404)
          .json({ ok: false, message: "Service not found" });
      }

      // decorator can only delete own
      if (req.user.role === "decorator") {
        if (String(service.createdBy || "") !== String(req.user._id)) {
          return res.status(403).json({ ok: false, message: "Forbidden" });
        }
      }

      await service.deleteOne();
      res.json({ ok: true, data: service });
    } catch (e) {
      console.error("DELETE /api/services/:id error:", e);
      res.status(500).json({ ok: false, message: "Failed to delete service" });
    }
  }
);



module.exports = router;
