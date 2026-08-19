const mongoose = require("mongoose");

const IndustrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, index: true },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model("Industry", IndustrySchema);
