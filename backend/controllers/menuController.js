const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Starters", "Main Course", "Biryani", "Breads", "Desserts", "Beverages"],
    default: "Main Course"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Menu", menuSchema);