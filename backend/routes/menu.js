const express = require("express");
const MenuItem = require("../models/MenuItem");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const allowedCategories = [
  "Starters",
  "Indian Main Course",
  "Punjabi",
  "Gujarati",
  "Italian",
  "Chinese",
  "Desserts",
  "Drinks"
];

// GET /api/menu
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && allowedCategories.includes(req.query.category)) {
      filter.category = req.query.category;
    }
    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Unable to load menu." });
  }
});

// GET /api/menu/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    res.json({ item });
  } catch (error) {
    res.status(400).json({ message: "Invalid menu item id." });
  }
});

// POST /api/menu  (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: "All menu fields are required." });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Please choose a valid category." });
    }

    const item = await MenuItem.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image.trim(),
      available: available !== false
    });

    res.status(201).json({ message: "Menu item added.", item });
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not add menu item." });
  }
});

// PUT /api/menu/:id  (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Please choose a valid category." });
    }

    if (name) item.name = name.trim();
    if (description) item.description = description.trim();
    if (price !== undefined) item.price = Number(price);
    if (category) item.category = category;
    if (image) item.image = image.trim();
    if (available !== undefined) item.available = Boolean(available);

    await item.save();
    res.json({ message: "Menu item updated.", item });
  } catch (error) {
    res.status(400).json({ message: "Could not update menu item." });
  }
});

// DELETE /api/menu/:id  (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    res.json({ message: "Menu item deleted." });
  } catch (error) {
    res.status(400).json({ message: "Could not delete menu item." });
  }
});

module.exports = router;
