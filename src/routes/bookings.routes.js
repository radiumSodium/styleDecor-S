const router = require("express").Router();
const Booking = require("../models/Booking");
const requireJWT = require("../middlewares/requireJWT");
const requireRole = require("../middlewares/requireRole");

// USER: create booking (after selecting service)
router.post("/", requireJWT, async (req, res) => {
  try {
    const {
      serviceId,
      serviceTitle,
      price,
      date,
      slot,
      notes,
      type,
      category,
      image,
      customerName,
      phone,
      venue,
      address,
    } = req.body;

    if (
      !serviceId ||
      !serviceTitle ||
      !date ||
      !slot ||
      !customerName ||
      !phone ||
      !venue ||
      !category
    ) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing required fields" });
    }

    const booking = await Booking.create({
      serviceId,
      serviceTitle,
      price: Number(price) || 0,
      date,
      slot,
      notes: notes || "",
      type,
      category,
      image: image || "",

      customerName,
      phone,
      venue,
      address: address || "",

      userId: req.user._id,
      userEmail: req.user.email,

      status: "assigned",
      paymentStatus: "unpaid",
    });

    res.status(201).json({ ok: true, data: booking });
  } catch (e) {
    console.error("POST /api/bookings error:", e);
    res.status(500).json({ ok: false, message: "Failed to create booking" });
  }
});

// USER: my bookings
router.get("/my", requireJWT, async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid JWT payload (missing _id)" });
    }

    const list = await Booking.find({ userId }).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error("GET /api/bookings/my error:", e);
    res.status(500).json({ ok: false, message: "Failed to load bookings" });
  }
});

// DECORATOR: my assigned bookings
router.get(
  "/assigned",
  requireJWT,
  requireRole(["decorator"]),
  async (req, res) => {
    try {
      const list = await Booking.find({
        assignedDecoratorId: req.user._id,
      }).sort({ createdAt: -1 });

      res.json({ ok: true, data: list });
    } catch (e) {
      console.error("GET /api/bookings/assigned error:", e);
      res
        .status(500)
        .json({ ok: false, message: "Failed to load assigned bookings" });
    }
  }
);

// ADMIN: all bookings
router.get("/all", requireJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const list = await Booking.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error("GET /api/bookings/all error:", e);
    res.status(500).json({ ok: false, message: "Failed to load bookings" });
  }
});

// Get single booking (user can access own booking)
router.get("/:id", requireJWT, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ ok: false, message: "Booking not found" });

    if (
      req.user.role === "user" &&
      String(booking.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    res.json({ ok: true, data: booking });
  } catch (e) {
    console.error("GET /api/bookings/:id error:", e);
    res.status(400).json({ ok: false, message: "Invalid booking id" });
  }
});

// Mark booking paid (user can pay own booking)
router.patch("/:id/pay", requireJWT, async (req, res) => {
  try {
    const { transactionId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ ok: false, message: "Booking not found" });

    if (
      req.user.role === "user" &&
      String(booking.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    booking.paymentStatus = "paid";
    booking.transactionId = transactionId || "";
    await booking.save();

    res.json({ ok: true, data: booking });
  } catch (e) {
    console.error("PATCH /api/bookings/:id/pay error:", e);
    res.status(500).json({ ok: false, message: "Failed to update payment" });
  }
});

// ADMIN: assign decorator/team
router.patch(
  "/:id/assign",
  requireJWT,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { decoratorId, team } = req.body;

      const booking = await Booking.findById(req.params.id);
      if (!booking)
        return res
          .status(404)
          .json({ ok: false, message: "Booking not found" });

      if (decoratorId !== undefined) {
        booking.assignedDecoratorId = decoratorId || null;
      }
      if (team !== undefined) {
        booking.assignedTeam = typeof team === "string" ? team : "";
      }

      booking.statusUpdatedAt = new Date();
      await booking.save();

      res.json({ ok: true, data: booking });
    } catch (e) {
      console.error("PATCH /api/bookings/:id/assign error:", e);
      res.status(500).json({ ok: false, message: "Failed to assign booking" });
    }
  }
);

// DECORATOR (or ADMIN): update status
router.patch(
  "/:id/status",
  requireJWT,
  requireRole(["admin", "decorator"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const allowed = [
        "assigned",
        "planning",
        "materials",
        "ontheway",
        "setup",
        "complete",
      ];

      if (!allowed.includes(status)) {
        return res.status(400).json({ ok: false, message: "Invalid status" });
      }

      const booking = await Booking.findById(req.params.id);
      if (!booking)
        return res
          .status(404)
          .json({ ok: false, message: "Booking not found" });

      if (req.user.role === "decorator") {
        if (
          !booking.assignedDecoratorId ||
          String(booking.assignedDecoratorId) !== String(req.user._id)
        ) {
          return res
            .status(403)
            .json({ ok: false, message: "Not your assigned booking" });
        }
      }

      booking.status = status;
      booking.statusUpdatedAt = new Date();
      await booking.save();

      res.json({ ok: true, data: booking });
    } catch (e) {
      console.error("PATCH /api/bookings/:id/status error:", e);
      res.status(500).json({ ok: false, message: "Failed to update status" });
    }
  }
);

module.exports = router;
