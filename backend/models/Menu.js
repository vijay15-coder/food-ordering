const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  quantity: { type: Number, required: true, min: 0 },
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Menu', menuSchema);