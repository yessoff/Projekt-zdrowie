const mongoose = require("mongoose");

const HealthRecordSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    bloodPressure: {
      type: String,
    },

    // 🔹 NOWE POLA
    steps: {
      type: Number,
      min: 0,
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
    },

    note: {
      type: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", HealthRecordSchema);
