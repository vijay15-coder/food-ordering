const mongoose = require("mongoose");
module.exports = mongoose.model("Order", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true }, quantity: { type: Number, required: true } }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'preparing', 'ready', 'completed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  orderNumber: { type: Number, unique: true },
  createdAt: { type: Date, default: Date.now }
}));
