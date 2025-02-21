const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    required: true,
    enum: ["sales", "inventory", "user_activity"],
  },
  dateRange: { type: Object, required: true }, // { start: Date, end: Date }
  generatedAt: { type: Date, default: Date.now },
  data: { type: Object, required: true }, // JSON data of the report
});

module.exports = mongoose.model("Report", ReportSchema);
