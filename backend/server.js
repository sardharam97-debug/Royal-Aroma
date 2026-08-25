const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("./models/User");
const MenuItem = require("./models/MenuItem");
const authRoutes = require("./routes/auth");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/images/hero.svg"));
});

// Serve the frontend folder so the site runs at http://localhost:5000
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// Contact form – validates and confirms (no extra model needed for viva)
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ message: "Message should be at least 10 characters." });
  }
  res.json({
    message: "Thank you. The Royal Aroma team will contact you shortly."
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 });
});

app.use(function (err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  console.error(err);
  res.status(500).json({ message: "Server error. Please try again." });
});

const seedMenu = [
  {
    name: "Paneer Tikka",
    description: "Cottage cheese marinated in royal spices and grilled in the tandoor.",
    price: 320,
    category: "Starters",
    image: "/images/paneer-tikka.svg"
  },
  {
    name: "Hara Bhara Kebab",
    description: "Spinach, peas and potato kebabs with mint chutney.",
    price: 280,
    category: "Starters",
    image: "/images/hara-bhara.svg"
  },
  {
    name: "Corn Cheese Balls",
    description: "Crisp golden balls filled with sweet corn and molten cheese.",
    price: 260,
    category: "Starters",
    image: "/images/corn-balls.svg"
  },
  {
    name: "Vegetable Spring Rolls",
    description: "Crispy rolls stuffed with garden vegetables and served with chilli sauce.",
    price: 240,
    category: "Starters",
    image: "/images/spring-rolls.svg"
  },
  {
    name: "Tomato Basil Soup",
    description: "Slow-cooked tomato soup finished with fresh basil and cream.",
    price: 190,
    category: "Starters",
    image: "/images/tomato-soup.svg"
  },
  {
    name: "Dahi Ke Kebab",
    description: "Soft hung-curd kebabs with roasted cumin and herbs.",
    price: 300,
    category: "Starters",
    image: "/images/dahi-kebab.svg"
  },
  {
    name: "Dal Makhani",
    description: "Black lentils simmered overnight with butter and cream.",
    price: 340,
    category: "Indian Main Course",
    image: "/images/dal-makhani.svg"
  },
  {
    name: "Palak Paneer",
    description: "Fresh spinach gravy with cubes of cottage cheese.",
    price: 360,
    category: "Indian Main Course",
    image: "/images/palak-paneer.svg"
  },
  {
    name: "Malai Kofta",
    description: "Velvet koftas in a saffron cashew gravy.",
    price: 380,
    category: "Indian Main Course",
    image: "/images/malai-kofta.svg"
  },
  {
    name: "Veg Dum Biryani",
    description: "Fragrant basmati rice layered with vegetables and royal spices.",
    price: 420,
    category: "Indian Main Course",
    image: "/images/veg-biryani.svg"
  },
  {
    name: "Paneer Lababdar",
    description: "Cottage cheese in a rich tomato-onion gravy with kasuri methi.",
    price: 390,
    category: "Indian Main Course",
    image: "/images/paneer-lababdar.svg"
  },
  {
    name: "Chole Bhature",
    description: "Punjabi chickpea curry served with fluffy fried bread.",
    price: 310,
    category: "Punjabi",
    image: "/images/chole-bhature.svg"
  },
  {
    name: "Sarson Da Saag",
    description: "Mustard greens cooked the traditional way, served with makki roti.",
    price: 350,
    category: "Punjabi",
    image: "/images/sarson-saag.svg"
  },
  {
    name: "Punjabi Kadhi Pakora",
    description: "Yogurt kadhi with gram-flour dumplings and steamed rice.",
    price: 290,
    category: "Punjabi",
    image: "/images/kadhi-pakora.svg"
  },
  {
    name: "Amritsari Kulcha Platter",
    description: "Stuffed kulchas with chole, pickle and butter.",
    price: 330,
    category: "Punjabi",
    image: "/images/kulcha.svg"
  },
  {
    name: "Paneer Butter Masala",
    description: "The classic Punjabi favourite in a silky tomato-butter gravy.",
    price: 400,
    category: "Punjabi",
    image: "/images/paneer-butter.svg"
  },
  {
    name: "Khaman Dhokla",
    description: "Steamed gram-flour cakes tempered with mustard and curry leaves.",
    price: 220,
    category: "Gujarati",
    image: "/images/dhokla.svg"
  },
  {
    name: "Undhiyu",
    description: "Seasonal winter vegetables slow-cooked with methi muthiya.",
    price: 360,
    category: "Gujarati",
    image: "/images/undhiyu.svg"
  },
  {
    name: "Gujarati Kadhi",
    description: "Mildly sweet yogurt kadhi served with jeera rice.",
    price: 240,
    category: "Gujarati",
    image: "/images/gujarati-kadhi.svg"
  },
  {
    name: "Thepla Thali",
    description: "Methi theplas with chunda, yogurt and pickle.",
    price: 280,
    category: "Gujarati",
    image: "/images/thepla.svg"
  },
  {
    name: "Khandvi",
    description: "Silky gram-flour rolls finished with coconut and sesame.",
    price: 230,
    category: "Gujarati",
    image: "/images/khandvi.svg"
  },
  {
    name: "Margherita Pizza",
    description: "Wood-fired pizza with tomato, mozzarella and basil.",
    price: 450,
    category: "Italian",
    image: "/images/margherita.svg"
  },
  {
    name: "Creamy Mushroom Pasta",
    description: "Penne in a white sauce with garlic mushrooms.",
    price: 430,
    category: "Italian",
    image: "/images/mushroom-pasta.svg"
  },
  {
    name: "Vegetable Lasagna",
    description: "Layered pasta with vegetables, cheese and herb tomato sauce.",
    price: 470,
    category: "Italian",
    image: "/images/lasagna.svg"
  },
  {
    name: "Garden Bruschetta",
    description: "Toasted artisan bread with tomatoes, olive oil and basil.",
    price: 260,
    category: "Italian",
    image: "/images/bruschetta.svg"
  },
  {
    name: "Risotto Primavera",
    description: "Creamy arborio rice with seasonal vegetables and parmesan.",
    price: 480,
    category: "Italian",
    image: "/images/risotto.svg"
  },
  {
    name: "Veg Manchurian",
    description: "Crisp vegetable dumplings in a glossy Indo-Chinese sauce.",
    price: 320,
    category: "Chinese",
    image: "/images/manchurian.svg"
  },
  {
    name: "Hakka Noodles",
    description: "Stir-fried noodles with crunchy vegetables and soy.",
    price: 300,
    category: "Chinese",
    image: "/images/hakka-noodles.svg"
  },
  {
    name: "Veg Fried Rice",
    description: "Wok-tossed rice with garden vegetables and spring onion.",
    price: 290,
    category: "Chinese",
    image: "/images/fried-rice.svg"
  },
  {
    name: "Chilli Paneer",
    description: "Cottage cheese tossed with peppers in a spicy chilli sauce.",
    price: 360,
    category: "Chinese",
    image: "/images/chilli-paneer.svg"
  },
  {
    name: "Honey Chilli Potatoes",
    description: "Crisp potato fingers glazed with honey and chilli.",
    price: 280,
    category: "Chinese",
    image: "/images/honey-chilli.svg"
  },
  {
    name: "Gulab Jamun",
    description: "Warm milk dumplings soaked in cardamom sugar syrup.",
    price: 180,
    category: "Desserts",
    image: "/images/gulab-jamun.svg"
  },
  {
    name: "Rasmalai",
    description: "Soft cottage-cheese discs in chilled saffron milk.",
    price: 200,
    category: "Desserts",
    image: "/images/rasmalai.svg"
  },
  {
    name: "Gajar Halwa",
    description: "Slow-cooked carrot pudding with ghee, nuts and khoya.",
    price: 220,
    category: "Desserts",
    image: "/images/gajar-halwa.svg"
  },
  {
    name: "Chocolate Brownie",
    description: "Warm walnut brownie served with vanilla ice cream.",
    price: 250,
    category: "Desserts",
    image: "/images/brownie.svg"
  },
  {
    name: "Kesar Kulfi",
    description: "Hand-churned saffron kulfi with pistachio.",
    price: 190,
    category: "Desserts",
    image: "/images/kulfi.svg"
  },
  {
    name: "Mango Lassi",
    description: "Thick yogurt drink blended with Alphonso mango.",
    price: 160,
    category: "Drinks",
    image: "/images/mango-lassi.svg"
  },
  {
    name: "Sweet Lassi",
    description: "Chilled Punjabi lassi finished with rose and cardamom.",
    price: 140,
    category: "Drinks",
    image: "/images/sweet-lassi.svg"
  },
  {
    name: "Masala Chaas",
    description: "Spiced buttermilk with roasted cumin and coriander.",
    price: 90,
    category: "Drinks",
    image: "/images/chaas.svg"
  },
  {
    name: "Fresh Lime Soda",
    description: "Fresh lime with soda, served sweet, salted or mixed.",
    price: 110,
    category: "Drinks",
    image: "/images/lime-soda.svg"
  },
  {
    name: "Virgin Mojito",
    description: "Mint, lime and soda cooler – completely non-alcoholic.",
    price: 170,
    category: "Drinks",
    image: "/images/mojito.svg"
  },
  {
    name: "Pomegranate Cooler",
    description: "Fresh pomegranate juice with a hint of mint.",
    price: 180,
    category: "Drinks",
    image: "/images/pomegranate.svg"
  },
  {
    name: "Rose Sharbat",
    description: "Traditional rose cordial served over crushed ice.",
    price: 130,
    category: "Drinks",
    image: "/images/rose-sharbat.svg"
  },
  {
    name: "Fresh Orange Juice",
    description: "Cold-pressed oranges served without added sugar.",
    price: 150,
    category: "Drinks",
    image: "/images/orange-juice.svg"
  },
  {
    name: "Tender Coconut Water",
    description: "Naturally sweet coconut water served chilled.",
    price: 120,
    category: "Drinks",
    image: "/images/coconut.svg"
  },
  {
    name: "Masala Chai",
    description: "Assam tea brewed with cardamom, ginger and cloves.",
    price: 80,
    category: "Drinks",
    image: "/images/masala-chai.svg"
  },
  {
    name: "Badam Milk",
    description: "Warm almond milk flavoured with saffron.",
    price: 160,
    category: "Drinks",
    image: "/images/badam-milk.svg"
  },
  {
    name: "Jaljeera",
    description: "Tangy cumin cooler with mint and black salt.",
    price: 100,
    category: "Drinks",
    image: "/images/jaljeera.svg"
  }
];

async function seedDatabase() {
  const adminEmail = "admin@royalaroma.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "Royal Aroma Admin",
      email: adminEmail,
      password: hashed,
      role: "admin"
    });
    console.log("Admin account created.");
  }

  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(seedMenu.map((item) => ({ ...item, available: true })));
    console.log("Menu seeded with vegetarian dishes and drinks.");
  }
}

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in the .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected.");
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Royal Aroma server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

start();
