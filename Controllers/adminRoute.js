const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

// BXB Schemas=======================================================
const Admins = require("../Models/Admins");
const Services = require("../Models/Services");

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
    res.status(200).json("hi admin");
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
    const adminExist = await Admins.findOne({ userName: userName });
    if (!adminExist) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
    const validation = await bcrypt.compare(password, adminExist.password);
    if (!validation) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
    // Generate token with user ID and name
    const token = jwt.sign(
      { id: adminExist._id, name: userName },
      process.env.TOKEN_ACCESS,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      AccessToken: token,
      adminID: adminExist._id,
      adminName: adminExist.userName,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Add Service endpoint==============================================
router.post(
  "/addService",
  TokenMiddleware,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        category,
        overView,
        totalPrice,
        miniServices,
        instructions,
        uploadedBy,
      } = req.body;

      const gallery = req.files.gallery
        ? req.files.gallery.map((file) =>
            file.path.replace("public" + path.sep, "")
          )
        : [];

      const service = new Services({
        title,
        category,
        overView,
        cover: req.files.cover
          ? req.files.cover[0].path.replace("public" + path.sep, "")
          : "",
        gallery,
        totalPrice,
        miniServices: JSON.parse(miniServices),
        instructions: JSON.parse(instructions),
        uploadedBy,
      });

      await service.save();
      res.status(200).json({ message: "added sucessfully", service });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  }
);

// getAllServices==============================================
router.get("/Services", (req, res) => {
  Services.find()
    .then((services) => {
      console.log(services);
      return res.status(200).json(services);
    })
    .catch((err) => {
      res.status(500).json({ message: "An error occurred: " + err.message });
    });
});

// Get Service by ID endpoint========================================
router.get("/service/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Services.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Get Services by Category endpoint
router.get("/services/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const services = await Services.find({ category: category });

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this category." });
    }

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Delete Service and Folder endpoint
router.delete("/deleteService/:id", TokenMiddleware, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const serviceToDelete = await Services.findById(serviceId);

    if (!serviceToDelete) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Delete the service
    await Services.findByIdAndDelete(serviceId);

    // Delete the folder associated with the service
    const folderPath = path.join("public", serviceToDelete.title);
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error deleting folder: " + err.message });
      }

      res
        .status(200)
        .json({ message: "Service and folder deleted successfully." });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
