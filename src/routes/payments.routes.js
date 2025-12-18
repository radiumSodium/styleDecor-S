const router = require("express").Router();
const Stripe = require("stripe");
const requireJWT = require("../middlewares/requireJWT");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", requireJWT, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res
        .status(400)
        .json({ ok: false, message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ ok: false, message: "Booking not found" });
    }

    // ✅ FIX: compare strings (ObjectId vs string issue)
    const bookingOwnerId = String(booking.userId);
    const requesterId = String(req.user._id);

    // Only owner/admin can pay
    if (req.user.role === "user" && bookingOwnerId !== requesterId) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({ ok: true, clientSecret: null, alreadyPaid: true });
    }

    const currency = process.env.STRIPE_CURRENCY || "usd";
    const amount = Math.max(1, Math.round(Number(booking.price || 0) * 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        bookingId: String(booking._id),
        userEmail: booking.userEmail || "",
      },
    });

    res.json({ ok: true, clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("create-payment-intent error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Failed to create payment intent" });
  }
});

router.post("/confirm", requireJWT, async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    if (!bookingId || !paymentIntentId) {
      return res
        .status(400)
        .json({ ok: false, message: "bookingId & paymentIntentId required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ ok: false, message: "Booking not found" });

    // only owner/admin
    if (
      req.user.role === "user" &&
      String(booking.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    // verify on Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi || pi.status !== "succeeded") {
      return res
        .status(400)
        .json({ ok: false, message: "Payment not successful" });
    }

    // prevent double save
    if (booking.paymentStatus === "paid") {
      return res.json({ ok: true, alreadyPaid: true });
    }

    // ✅ store payment in DB
    const receiptUrl = pi.charges?.data?.[0]?.receipt_url || "";
    await Payment.create({
      bookingId: booking._id,
      userId: booking.userId,
      userEmail: booking.userEmail,
      amount: pi.amount,
      currency: pi.currency,
      paymentIntentId: pi.id,
      status: pi.status,
      receiptUrl,
    });

    // ✅ update booking
    booking.paymentStatus = "paid";
    booking.transactionId = pi.id;
    booking.paidAt = new Date();
    await booking.save();

    res.json({ ok: true, data: { booking, receiptUrl } });
  } catch (e) {
    console.error("POST /api/payments/confirm error:", e);
    res.status(500).json({ ok: false, message: "Failed to confirm payment" });
  }
});
router.get("/my", requireJWT, async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? {}
        : req.user.role === "decorator"
        ? {} // decorator can see all OR only assigned (your choice)
        : { userId: req.user._id };

    const list = await Payment.find(query).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error("GET /api/payments/my error:", e);
    res.status(500).json({ ok: false, message: "Failed to load payments" });
  }
});
module.exports = router;
