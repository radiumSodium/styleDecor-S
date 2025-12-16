const router = require("express").Router();
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const verifyJWT = require("../middlewares/verifyJWT");
const requireRole = require("../middlewares/requireRole");
const user = require("../models/user");

// USER: create booking (after selecting service)
router.post("/", verifyJWT, async (req, res) => {
  const { serviceId, date, slot, venue, address, notes } = req.body;

  if (!serviceId || !date || !slot || !venue) {
    return res.status(400).json({ ok: false, message: "Missing required fields" });
  }

  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ ok: false, message: "Service not found" });

  const user = await user.findById(req.auth._id);
  if (!user) return res.status(401).json({ ok: false, message: "User not found" });

  const booking = await Booking.create({
    serviceId: service._id,
    serviceTitle: service.title,
    price: service.price,
    type: service.type,

    userId: user._id,
    userEmail: user.email,

    date,
    slot,
    venue,
    address: address || "",
    notes: notes || "",

    status: "assigned",
  });

  res.status(201).json({ ok: true, data: booking });
});

// USER: my bookings
router.get("/my", verifyJWT, async (req, res) => {
  const list = await Booking.find({ userId: req.auth._id }).sort({ createdAt: -1 });
  res.json({ ok: true, data: list });
});

// DECORATOR: my assigned bookings
router.get(
  "/assigned",
  verifyJWT,
  requireRole(["decorator"]),
  async (req, res) => {
    const list = await Booking.find({ assignedDecoratorId: req.auth._id }).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  }
);

// ADMIN: all bookings
router.get(
  "/all",
  verifyJWT,
  requireRole(["admin"]),
  async (req, res) => {
    const list = await Booking.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  }
);

// ADMIN: assign decorator/team
router.patch(
  "/:id/assign",
  verifyJWT,
  requireRole(["admin"]),
  async (req, res) => {
    const { decoratorId, team } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

    booking.assignedDecoratorId = decoratorId || booking.assignedDecoratorId;
    booking.assignedTeam = typeof team === "string" ? team : booking.assignedTeam;
    booking.statusUpdatedAt = new Date();
    await booking.save();

    res.json({ ok: true, data: booking });
  }
);

// DECORATOR (or ADMIN): update status
router.patch(
  "/:id/status",
  verifyJWT,
  requireRole(["admin", "decorator"]),
  async (req, res) => {
    const { status } = req.body;
    const allowed = ["assigned", "planning", "materials", "ontheway", "setup", "complete"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ ok: false, message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

    // decorator can only update their own assigned booking
    if (req.auth.role === "decorator") {
      if (!booking.assignedDecoratorId || booking.assignedDecoratorId.toString() !== req.auth._id) {
        return res.status(403).json({ ok: false, message: "Not your assigned booking" });
      }
    }

    booking.status = status;
    booking.statusUpdatedAt = new Date();
    await booking.save();

    res.json({ ok: true, data: booking });
  }
);

module.exports = router;