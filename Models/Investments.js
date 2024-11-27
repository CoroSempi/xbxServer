const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema({
  type: {
    default: "Investment",
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amountInvested: {
    type: Number,
    default: 0,
    required: true,
  },
  numberOfShares: {
    type: Number,
    required: true,
  },
  numberOfInvestors: {
    type: Number,
    default: 0,
    required: true,
  },
  profit: {
    type: Number,
    default: 0,
    required: true,
  },
  investmentDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  createdBy: {
    type: String,
    ref: "Admin",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
    required: true,
  },
  additionalInfo: {
    type: String,
    required: false,
  },
});

const Investments = mongoose.model("Investments", InvestmentSchema);

module.exports = Investments;
