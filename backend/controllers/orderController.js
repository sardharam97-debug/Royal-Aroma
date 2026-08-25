const Order = require("../models/orders");

// નવી ઓર્ડર પ્લેસ કરવા માટે (Live Location સાથે)
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      flat,
      address,
      instructions,
      locationCoordinates,
      items,
      totalAmount
    } = req.body;

    const newOrder = new Order({
      userId: userId || null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "guest@royalaroma.com",
      flat,
      address,
      instructions,
      locationCoordinates: {
        latitude: locationCoordinates?.latitude || null,
        longitude: locationCoordinates?.longitude || null
      },
      items,
      totalAmount,
      status: "Pending"
    });

    const savedOrder = await newOrder.save();
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place order"
    });
  }
};

// બધા ઓર્ડર્સ જોવા માટે (Admin Panel માટે)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};