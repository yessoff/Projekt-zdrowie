const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetWeight: {
      type: Number,
    },
    // NOWE POLE – cel kroków dziennie
    targetSteps: {
      type: Number,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("Goal", goalSchema);
