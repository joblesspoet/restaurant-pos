const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Public routes
router.post("/login", userController.loginUser);

// Admin-only routes
router.post("/register", auth.authMiddleware, roleCheck("admin"), userController.registerUser);
router.get("/", auth.authMiddleware, roleCheck("admin"), userController.getAllUsers);
router.get("/:id", auth.authMiddleware, roleCheck("admin"), userController.getUserById);
router.put("/:id", auth.authMiddleware, roleCheck("admin"), userController.updateUser);
router.delete("/:id", auth.authMiddleware, roleCheck("admin"), userController.deleteUser);

module.exports = router;
