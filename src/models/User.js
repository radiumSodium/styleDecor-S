const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin", "decorator"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
