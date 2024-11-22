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

// Schema for Users
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
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

  cart: [
    {
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
    },
  ],
  ordersHistory: [OrderSchema],
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
});

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
