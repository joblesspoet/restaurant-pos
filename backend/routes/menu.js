const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const menuController = require("../controllers/menuController");
const auth = require("../middleware/auth"); // Ensure it's correctly imported
const checkRole = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

router.post(
  "/",
  auth.adminMiddleware, // Ensure this is a function, not an object
  checkRole("admin"),
  [
    body("name").notEmpty().trim(),
    body("description").notEmpty().trim(),
    body("price").isNumeric(),
    body("category").notEmpty().trim(),
  ],
  upload.single("image"), // Move upload middleware after validation
  menuController.createMenuItem
);

router.get("/", menuController.getAllMenuItems);

router.put(
  "/:id",
  auth.adminMiddleware,
  checkRole("admin"),
  [
    body("name").optional().trim(),
    body("description").optional().trim(),
    body("price").optional().isNumeric(),
    body("category").optional().trim(),
  ],
  upload.single("image"),
  menuController.updateMenuItem
);

router.delete(
  "/:id",
  auth.adminMiddleware,
  checkRole("admin"),
  menuController.deleteMenuItem
);

module.exports = router;
