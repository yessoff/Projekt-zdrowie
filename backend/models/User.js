const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    sex: {
      type: String,
      enum: ["M", "K", "Inne"],
      default: "Inne",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
