const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  notes: String,
});

const paymentLogSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["cash", "card_machine"],
    required: true,
  },
  cardLastDigits: {
    type: String,
    // Only for card payments
  },
  receiptNumber: {
    type: String,
    // For card machine reference
  },
  cashierName: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    table: {
      type: Number,
    },
    customer: {
      name: String,
      phone: String,
      address: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "refunded"],
      default: "pending",
    },
    paymentLogs: [paymentLogSchema],
    printedCount: {
      type: Number,
      default: 0,
    },
    server: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
