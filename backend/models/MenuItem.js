const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 1
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Starters",
      "Indian Main Course",
      "Punjabi",
      "Gujarati",
      "Italian",
      "Chinese",
      "Desserts",
      "Drinks"
    ]
  },
  image: {
    type: String,
    required: [true, "Image is required"]
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
