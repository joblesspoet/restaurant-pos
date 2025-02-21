const Report = require("../models/Report");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    let reportData = {};

    if (!reportType || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    switch (reportType) {
      case "inventory":
        reportData = await Inventory.find({
          lastUpdated: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        break;

      case "user_activity":
        reportData = await User.find({
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).select("-password");
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    const newReport = new Report({
      reportType,
      dateRange: { start: startDate, end: endDate },
      data: reportData,
    });

    await newReport.save();
    res
      .status(201)
      .json({ message: "Report generated successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reports", error });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving report", error });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport)
      return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
  }
};
