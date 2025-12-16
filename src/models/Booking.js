const mongoose = require("mongoose");

const STATUS = [
  "assigned",
  "planning",
  "materials",
  "ontheway",
  "setup",
  "complete",
];

const bookingSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceTitle: { type: String, required: true },
    price: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["studio", "onsite", "both"],
      default: "onsite",
    },
    category: { type: String, enum: ["home", "ceremony"], required: true },
    image: { type: String, default: "" },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: { type: String, required: true },

    // customer info
    customerName: { type: String, required: true },
    phone: { type: String, required: true },

    date: { type: String, required: true },
    slot: { type: String, required: true },

    venue: { type: String, required: true },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },

    assignedDecoratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedTeam: { type: String, default: "" },

    status: { type: String, enum: STATUS, default: "assigned" },
    statusUpdatedAt: { type: Date, default: Date.now },

    // payment (UI now, Stripe later)
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    transactionId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
