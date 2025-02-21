const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.post(
  "/",
  auth.authMiddleware,
  checkRole("admin", "waiter", "cashier"),
  [
    body("items").isArray(),
    body("type").isIn(["dine-in", "takeaway", "delivery"]),
    body("table").optional().isNumeric(),
    body("customer").optional().isObject(),
  ],
  orderController.createOrder
);

router.put(
  "/:id/status",
  auth.authMiddleware,
  checkRole("admin", "chef"),
  orderController.updateOrderStatus
);

router.get("/", auth.authMiddleware, orderController.getOrders);

router.get("/kitchen", 
  auth.authMiddleware,
  checkRole("admin", "chef"),
  orderController.getOrders
);

router.get("/my-orders",
  auth.authMiddleware,
  checkRole("waiter"),
  orderController.getOrders
);

module.exports = router;
