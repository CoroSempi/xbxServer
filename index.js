const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const SuperAdmin = require("./Controllers/superAdminRoute");
const Admin = require("./Controllers/adminRoute");
const User = require("./Controllers/userRoute");
const Services = require("./Controllers/Services");
const Products = require("./Controllers/Products");

// Create an Express app
const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Routes
app.use("/superAdmin", SuperAdmin);
app.use("/admin", Admin);
app.use("/user", User);
app.use("/services", Services);
app.use("/products", Products);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
async function run() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@xbx.uyags.mongodb.net/XBX`
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

// Connect MongoDB
run();
let port = process.env.PORT || 3001;
// Start server
app.listen(port, () => {
  console.log(`SERVER RUN ON PORT ${port}`);
});

// Default route
app.get("/", (req, res) => {
  res.status(200).send("XBX Server");
});

// Export the app for Vercel serverless functions
module.exports = app;
