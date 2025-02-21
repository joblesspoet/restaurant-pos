const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  supplier: { type: String },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inventory", InventorySchema);
