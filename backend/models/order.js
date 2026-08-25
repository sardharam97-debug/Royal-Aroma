const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // ગેસ્ટ અથવા લોગિન વગર ઓર્ડર હોય તો એરર ન આવે
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  flat: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: ""
  },
  locationCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [(arr) => arr.length > 0, "Order must contain at least one item."]
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Completed",
      "Cancelled"
    ],
    default: "Pending"
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);