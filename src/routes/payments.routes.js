const router = require("express").Router();
const Stripe = require("stripe");
const requireJWT = require("../middlewares/requireJWT");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent (returns clientSecret)
router.post("/create-payment-intent", requireJWT, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res
        .status(400)
        .json({ ok: false, message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ ok: false, message: "Booking not found" });

    // Only owner/admin can pay
    if (
      req.user.role === "user" &&
      booking.userId.toString() !== req.user._id
    ) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({ ok: true, clientSecret: null, alreadyPaid: true });
    }

    // Stripe uses smallest currency unit (cents)
    // IMPORTANT: Stripe does NOT support BDT in many accounts/regions.
    // Use USD in test mode unless you know your Stripe account supports BDT.
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const amount = Math.max(1, Math.round(Number(booking.price || 0) * 100)); // e.g. 16000 -> 1600000 cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        bookingId: booking._id.toString(),
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

module.exports = router;
