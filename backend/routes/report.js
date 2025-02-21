const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.post("/generate", reportController.generateReport);
router.get("/", reportController.getReports);
router.get("/:id", reportController.getReportById);
router.delete("/:id", reportController.deleteReport);

module.exports = router;
