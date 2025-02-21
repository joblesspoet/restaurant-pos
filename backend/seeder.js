require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");

const DB_URI =
  "mongodb+srv://joblesspoet:uxybxtJHR1gaWc9L@cluster0.y7qwl.mongodb.net/pos_system?retryWrites=true&w=majority&appName=Cluster0";

if (!DB_URI) {
  console.error("MongoDB connection URI is not defined");
  process.exit(1);
}

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Cashier User",
    email: "cashier@example.com",
    password: "cashier123",
    role: "cashier",
  },
  {
    name: "Chef User",
    email: "chef@example.com",
    password: "chef123",
    role: "chef",
  },
  {
    name: "Waiter User",
    email: "waiter@example.com",
    password: "waiter123",
    role: "waiter",
  },
];

const menuItems = [
  {
    name: "Crispy Calamari",
    description: "Tender calamari rings, lightly breaded and fried, served with marinara sauce",
    price: 12.99,
    category: "appetizers",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24",
    available: true
  },
  {
    name: "Bruschetta",
    description: "Grilled bread rubbed with garlic and topped with diced tomatoes, fresh basil, and olive oil",
    price: 9.99,
    category: "appetizers",
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f",
    available: true
  },
  {
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon fillet, grilled to perfection with lemon herb butter",
    price: 24.99,
    category: "main_course",
    image: "https://images.unsplash.com/photo-1567189022371-cc754891cdc9",
    available: true
  },
  {
    name: "Beef Tenderloin",
    description: "8oz prime beef tenderloin, served with roasted vegetables and red wine sauce",
    price: 32.99,
    category: "main_course",
    image: "https://images.unsplash.com/photo-1558030006-450675393462",
    available: true
  },
  {
    name: "Tiramisu",
    description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream",
    price: 8.99,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
    available: true
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 9.99,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
    available: true
  },
  {
    name: "Fresh Fruit Smoothie",
    description: "Blend of seasonal fruits with yogurt and honey",
    price: 6.99,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625",
    available: true
  },
  {
    name: "Italian Soda",
    description: "Sparkling water with your choice of flavored syrup and cream",
    price: 4.99,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1558645836-e44122a743ee",
    available: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      MenuItem.deleteMany()
    ]);

    // Seed users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log("Users created successfully");

    // Seed menu items
    await MenuItem.insertMany(menuItems);
    console.log("Menu items created successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
