const mongoose = require("mongoose");

const STATUS = ["assigned", "planning", "materials", "ontheway", "setup", "complete"];

const bookingSchema = new mongoose.Schema(
  {
    // service snapshot
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    serviceTitle: { type: String, required: true },
    price: { type: Number, default: 0 },
    type: { type: String, enum: ["studio", "onsite", "both"], default: "onsite" },

    // user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },

    // schedule
    date: { type: String, required: true }, // YYYY-MM-DD
    slot: { type: String, required: true }, // "5:00 PM"

    // venue
    venue: { type: String, required: true },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },

    // assignment
    assignedDecoratorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedTeam: { type: String, default: "" }, // admin can write team info for onsite

    // status
    status: { type: String, enum: STATUS, default: "assigned" },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);