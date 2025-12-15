const { Schema, model } = require("mongoose");

const decoratorProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    specialty: { type: String, default: "Wedding, Home" },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("DecoratorProfile", decoratorProfileSchema);