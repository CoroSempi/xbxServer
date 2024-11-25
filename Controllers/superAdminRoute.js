const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

// BXB Schemas=======================================================
const SuperAdmin = require("../Models/SuperAdmin");
const Admins = require("../Models/Admins");
const Services = require("../Models/Services");
const Products = require("../Models/Products");

const { console } = require("inspector");

// async function run() {
//   const hashPassword = await bcrypt.hash("1234", 10);
//   const ss = new SuperAdmin({ userName: "SuperAdmin", password: hashPassword });
//   ss.save();
// }

// run()

// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to set headers
const setHeadersMiddleware = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
};
// Apply middleware to the whole route
router.use(setHeadersMiddleware);

// Token Middleware==================================================
function TokenMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No authorization header provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, process.env.TOKEN_ACCESS, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Unauthorized access." });
    }
    req.user = user;
    next();
  });
}

// Set up Multer storage configuration===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.body.title;
    const folderPath = path.join("public", folderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      file.fieldname === "cover"
        ? `${req.body.title}Cover`
        : `${req.body.title}_Gallery_${Math.round(Math.random() * 100)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    res.status(200).json("hi SuperAdmin");
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching messages" });
  }
});

// SignIn endpoint===================================================
router.post("/SignIn", async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const superAdminExist = await SuperAdmin.findOne({ userName: userName });
    if (!superAdminExist) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
    const validation = await bcrypt.compare(password, superAdminExist.password);
    if (!validation) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
    // Generate token with user ID and name
    const token = jwt.sign(
      { id: superAdminExist._id, name: userName },
      process.env.TOKEN_ACCESS,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      AccessToken: token,
      adminID: superAdminExist._id,
      superAdminName: superAdminExist.userName,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

//addAdmins====================================================
router.post("/addAdmin", TokenMiddleware, async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const AdminExist = await Admins.findOne({ userName: userName });
    if (AdminExist) {
      return res.status(401).json({ message: "Admin already Exist ." });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admins({
      userName: userName,
      password: hashPassword,
    });
    await newAdmin.save().then((e) => {
      res.status(200).json({ message: "Admin Added Successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// deleteAdmin====================================================
router.delete("/deleteAdmin", TokenMiddleware, async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName) {
      return res.status(400).json({ message: "User name is required." });
    }

    const adminToDelete = await Admins.findOne({ userName: userName });
    if (!adminToDelete) {
      return res.status(404).json({ message: "Admin not found." });
    }

    await Admins.deleteOne({ userName: userName });
    res.status(200).json({ message: "Admin deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// adminList====================================================
router.get("/adminList", TokenMiddleware, async (req, res) => {
  try {
    const adminsList = await Admins.find();

    res.status(200).json(adminsList);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// adminUploads====================================================
router.get("/adminUploads/:id", TokenMiddleware, async (req, res) => {
  try {
    const adminId = req.params.id;
    const adminName = await Admins.findById(adminId);

    const adminServices = await Services.find({ uploadedBy: adminId });
    const adminProducts = await Products.find({ uploadedBy: adminId });

    res.status(200).json({
      adminName: adminName.userName,
      adminServices: adminServices,
      adminProducts: adminProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
