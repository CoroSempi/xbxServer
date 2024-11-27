const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// BXB Schemas=======================================================

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

// getAllInvestments==============================================
router.post("/", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "MERN Stack Development",
          },
          unit_amount: 50 * 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["EG"],
    },
    success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });

  console.log(session.url);
  res.redirect(session.url);
});

module.exports = router;
