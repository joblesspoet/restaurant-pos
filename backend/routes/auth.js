const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");

router.post(
  "/register",
  [
    body("name").notEmpty().trim(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["admin", "cashier", "chef"]),
  ],
  authController.register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  authController.login
);

module.exports = router;
