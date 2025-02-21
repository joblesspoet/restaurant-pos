const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.post(
  "/process",
  auth.authMiddleware,
  checkRole("admin", "cashier"),
  paymentController.processPayment
);

router.post(
  "/:orderId/refund",
  auth.authMiddleware,
  checkRole("admin"),
  paymentController.refundPayment
);

// Log payment for an order
router.post(
  "/:orderId/log",
  auth.authMiddleware,
  checkRole("admin", "cashier"),
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("method")
      .isIn(["cash", "card_machine"])
      .withMessage("Invalid payment method"),
    body("cardLastDigits")
      .optional()
      .isLength({ min: 4, max: 4 })
      .withMessage("Card last digits must be 4 characters"),
    body("receiptNumber").optional().isString(),
    body("notes").optional().isString(),
  ],
  paymentController.logPayment
);

// Print receipt
router.post(
  "/:orderId/print",
  auth.authMiddleware,
  checkRole("admin", "cashier", "chef", "waiter"),
  paymentController.printReceipt
);

module.exports = router;
