const mongoose = require("mongoose");

module.exports = mongoose.model("ScratchCard", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prize: { type: Number },
  scratched: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));