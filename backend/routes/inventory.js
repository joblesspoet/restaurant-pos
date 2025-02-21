const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

// Get all inventory items
router.get("/", auth.authMiddleware, inventoryController.getAllItems);

// Get a single inventory item by ID
router.get("/:id", auth.authMiddleware, inventoryController.getItemById);

// Add a new inventory item (Admin only)
router.post(
  "/",
  auth.adminMiddleware,
  checkRole("admin"),
  inventoryController.addItem
);

// Update an inventory item (Admin only)
router.put(
  "/:id",
  auth.adminMiddleware,
  checkRole("admin"),
  inventoryController.updateItem
);

// Delete an inventory item (Admin only)
router.delete(
  "/:id",
  auth.adminMiddleware,
  checkRole("admin"),
  inventoryController.deleteItem
);

module.exports = router;
