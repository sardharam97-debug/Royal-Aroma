const express = require("express");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const allowedStatus = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Completed",
  "Cancelled"
];

// POST /api/orders  – create order (logged-in user)
router.post("/", protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const qty = Number(cartItem.quantity);
      if (!cartItem.menuItemId || !qty || qty < 1) {
        return res.status(400).json({ message: "Invalid cart item." });
      }

      const menuItem = await MenuItem.findById(cartItem.menuItemId);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({
          message: `${cartItem.name || "An item"} is currently unavailable.`
        });
      }

      const lineTotal = menuItem.price * qty;
      totalAmount += lineTotal;
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        image: menuItem.image
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: orderItems,
      totalAmount,
      status: "Pending"
    });

    res.status(201).json({
      message: "Order placed successfully.",
      order
    });
  } catch (error) {
    res.status(500).json({ message: "Could not place order. Please try again." });
  }
});

// GET /api/orders/my  – logged-in user's orders
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ orderDate: -1 });
  res.json({ orders });
});

// GET /api/orders/stats  – admin dashboard numbers
router.get("/stats", protect, adminOnly, async (req, res) => {
  const [totalUsers, totalMenuItems, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments({ role: "user" }),
    MenuItem.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
  ]);

  res.json({
    totalUsers,
    totalMenuItems,
    totalOrders,
    totalRevenue: revenueAgg[0] ? revenueAgg[0].total : 0
  });
});

// GET /api/orders  – all orders (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  const orders = await Order.find().sort({ orderDate: -1 });
  res.json({ orders });
});

// PUT /api/orders/:id/status  – update status (admin)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated.", order });
  } catch (error) {
    res.status(400).json({ message: "Could not update order status." });
  }
});

module.exports = router;
