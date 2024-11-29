const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// BXB Schemas=======================================================
const Users = require("../Models/Users");

// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const TokenMiddleware = require("../middleware/TokenMiddleware.js");

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

// PaymentServices==============================================
router.post("/services", TokenMiddleware, async (req, res) => {
  const selectedServices = req.body.miniServices;
  const { serviceID, serviceTitle } = req.body;

  if (selectedServices.length === 0) {
    return res
      .status(400)
      .json({ message: "Please select at least one service" });
  }
  const priceData = selectedServices.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.title,
      },
      unit_amount: item.price * 100, // Amount in cents
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: priceData,
    mode: "payment",
    success_url: `${process.env.BASE_URL}/payments/complete?session_id={CHECKOUT_SESSION_ID}&userName=${req.user.name}&serviceID=${serviceID}&serviceTitle=${serviceTitle}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });

  res.send(session.url);
});

router.get("/complete", async (req, res) => {
  try {
    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ["payment_intent.payment_method"],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);

    // Check the payment status
    if (session.payment_status === "paid") {
      const userExist = await Users.findOne({ userName: req.query.userName });

      const miniServices = lineItems.data.map((item) => ({
        title: item.description,
        price: item.amount_total / 100,
      }));

      userExist.userService.push({
        serviceId: req.query.serviceID,
        serviceTitle: req.query.serviceTitle,
        miniServices: miniServices,
        totalPricePaid: session.amount_total / 100,
      });

      await userExist.save();
      return res.redirect("/pp");
    } else {
      return res.status(400).json({
        success: false,
        title: req.query.serviceTitle,
        id: req.query.serviceID,
        miniServices,
        total: session.amount_total,
      });
    }
  } catch (error) {
    console.error("Error retrieving session:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
});

// Define the route
router.get("/completeInt", async (req, res) => {
  try {
    res.render("PaymentDone");
  } catch (error) {
    console.error("Error retrieving session:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
});
module.exports = router;
