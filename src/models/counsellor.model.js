const mongoose = require("mongoose");

const CounsellorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    keywords: { type: [String], default: [] },
    shortDescription: { type: String, default: "" },

    // S3 object key; null when no image was uploaded (clients show a placeholder)
    profileImageKey: { type: String, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counsellor", CounsellorSchema);
