const mongoose = require("mongoose");

// Schema for a single Order Item
const OrderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

// Schema for a single Order
const OrderSchema = new mongoose.Schema({
  items: [OrderItemSchema],
  totalOrderPrice: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
});

const InvestmentProjectSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project", // Assuming you have a Project model
    required: true,
  },
  sharesAmount: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    default: 0,
  },
  investmentDate: {
    type: Date,
    default: Date.now,
  },
});

// Schema for Users
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: "user",
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    value: {
      type: String,
      unique: true,
      required: true,
    },
    verifctionCode: {
      type: Number,
      required: true,
    },
    confirmation: {
      type: Boolean,
      default: false,
    },
  },
  nationalId: {
    type: String,
    default: null,
  },
  nationalIdConfirmation: {
    type: Boolean,
    default: false,
  },
  ordersHistory: [OrderSchema],
  investments: [InvestmentProjectSchema],

  paymentData: {
    token: {
      type: String,
    },
    name: {
      type: String,
    },
    last4Numbers: {
      type: String,
    },
  },

  balance: {
    type: Number,
    default: 0,
  },
  withdrawableBalance: {
    type: Number,
    default: 0,
  },
});

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
