const { Schema, model } = require("mongoose");

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ["home", "ceremony"], required: true },
    type: { type: String, enum: ["studio", "onsite", "both"], default: "both" },
    price: { type: Number, required: true, min: 0 },
    durationMins: { type: Number, default: 60 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = model("Service", serviceSchema);