const mongoose = require('mongoose');
const AdminModel = require('./models/Admin');
require('dotenv').config();

// જો Admin model default/named export તરીકે હોય તો બંને ચેક કરી લેશે
const Admin = AdminModel.Admin || AdminModel.default || AdminModel;

const admins = [
  {
    name: "Mansi Sardhara",
    email: "sardharam97@gmail.com",
    phone: "8320104694",
    password: "mansisardhara52",
    role: "admin"
  },
  {
    name: "Yogi Savani",
    email: "savaniyogi33@gmail.com",
    phone: "7984228814",
    password: "yogisavani103",
    role: "admin"
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/royal_aroma')
  .then(async () => {
    console.log("DB Connected");
    for (let admin of admins) {
      const exists = await Admin.findOne({ email: admin.email });
      if (!exists) {
        await Admin.create(admin);
        console.log(`Admin created: ${admin.email}`);
      } else {
        console.log(`Admin already exists: ${admin.email}`);
      }
    }
    console.log("Seeding complete!");
    process.exit();
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });