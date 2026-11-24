require("dotenv").config();
const { connectDB } = require("./config/db");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@example.com";
    const password = "Admin@123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists with email:", email);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Store Administrator",
      email,
      password, // Password hashing happens automatically via userSchema pre('save') hook
      role: "admin",
      isActive: true,
      phone: "+92 321 3633473",
    });

    console.log("=================================");
    console.log("✅ Admin user created successfully!");
    console.log("ID:", admin._id);
    console.log("Email:", admin.email);
    console.log("Password:", password);
    console.log("Role:", admin.role);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Create Admin Error:", error.message);
    process.exit(1);
  }
};

createAdmin();
