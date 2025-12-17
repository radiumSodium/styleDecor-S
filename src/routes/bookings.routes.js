const router = require("express").Router();
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const requireJWT = require("../middlewares/requireJWT");
const requireRole = require("../middlewares/requireRole");
const user = require("../models/user");

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
    console.error(e);
    res.status(500).json({ ok: false, message: "Failed to create booking" });
  }
});

// USER: my bookings

router.get("/my", requireJWT, async (req, res) => {
  try {
    const userId = req.user?._id; // ✅ FIX: req.user not req.user

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
    const list = await Booking.find({ assignedDecoratorId: req.user._id }).sort(
      { createdAt: -1 }
    );
    res.json({ ok: true, data: list });
  }
);

// ADMIN: all bookings
router.get("/all", requireJWT, requireRole(["admin"]), async (req, res) => {
  const list = await Booking.find({}).sort({ createdAt: -1 });
  res.json({ ok: true, data: list });
});

// ADMIN: assign decorator/team

router.get("/:id", requireJWT, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking)
    return res.status(404).json({ ok: false, message: "Booking not found" });

  // user can only access own booking
  if (req.user.role === "user" && booking.userId.toString() !== req.user._id) {
    return res.status(403).json({ ok: false, message: "Forbidden" });
  }

  res.json({ ok: true, data: booking });
});

router.patch("/:id/pay", requireJWT, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ ok: false, message: "Booking not found" });

    if (
      req.user.role === "user" &&
      booking.userId.toString() !== req.user._id
    ) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    booking.paymentStatus = "paid";
    booking.transactionId = transactionId || "";
    await booking.save();

    res.json({ ok: true, data: booking });
  } catch (e) {
    console.error("pay booking error:", e);
    res.status(500).json({ ok: false, message: "Failed to update payment" });
  }
});

router.patch(
  "/:id/assign",
  requireJWT,
  requireRole(["admin"]),
  async (req, res) => {
    const { decoratorId, team } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ ok: false, message: "Booking not found" });

    booking.assignedDecoratorId = decoratorId || booking.assignedDecoratorId;
    booking.assignedTeam =
      typeof team === "string" ? team : booking.assignedTeam;
    booking.statusUpdatedAt = new Date();
    await booking.save();

    res.json({ ok: true, data: booking });
  }
);

// DECORATOR (or ADMIN): update status
router.patch(
  "/:id/status",
  requireJWT,
  requireRole(["admin", "decorator"]),
  async (req, res) => {
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
      return res.status(404).json({ ok: false, message: "Booking not found" });

    // decorator can only update their own assigned booking
    if (req.user.role === "decorator") {
      if (
        !booking.assignedDecoratorId ||
        booking.assignedDecoratorId.toString() !== req.user._id
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
  }
);

module.exports = router;
