const mongoose = require("mongoose");

/**
 * DISHA — Test 6 of 8: Creative Thinking, Innovation Mindset, Entrepreneurial
 * Potential & Problem-Solving Style. Stores the full multi-section submission
 * plus the computed result so the report can be regenerated without
 * re-scoring. One active record per student (latest attempt overwrites,
 * attemptNumber increments) — mirrors the Test-1/2/3/4/5 models in this
 * codebase. Unlike the Class 10 / Class 12 tests, T6 is part of the general
 * numbered battery and carries no class restriction.
 */
const Disha6AssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    profile: {
      currentClass: String,
    },

    // ---- Raw responses, kept per section for transparency / re-scoring ----
    responses: {
      divergentTasks: { type: Map, of: String }, // Section A { taskId: free-text }
      creativeSelfReport: { type: Map, of: Number }, // Section B { id: 1..5 }
      innovationMindset: { type: Map, of: Number }, // Section C likert
      innovationFc: { type: Map, of: String }, // Section C FC { pairId: "A"|"B" }
      entrepreneurial: { type: Map, of: Number }, // Section D
      problemSolvingStyle: { type: Map, of: Number }, // Section E
      designSensitivity: { type: Map, of: Number }, // Section F
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // Blocks G + H
      validity: { type: Map, of: Number }, // LikeMe items
    },

    // ---- Computed result (output of the Test-6 scoring engine) ----
    result: {
      divergentTasks: mongoose.Schema.Types.Mixed, // per-task Fluency/Flexibility/Originality/Elaboration
      creativeSelfReport: mongoose.Schema.Types.Mixed, // sub-scales + Suppression Index
      innovationMindset: mongoose.Schema.Types.Mixed, // sub-scales + FC style tally
      entrepreneurial: mongoose.Schema.Types.Mixed, // ERI + profile category
      problemSolvingStyle: mongoose.Schema.Types.Mixed, // 4 styles + dominant/secondary
      designSensitivity: mongoose.Schema.Types.Mixed, // sub-scales + cluster unlock
      sjt: mongoose.Schema.Types.Mixed, // competencies
      validity: mongoose.Schema.Types.Mixed,
      cqProfile: mongoose.Schema.Types.Mixed, // Creative Quotient composite + band
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha6Assessment", Disha6AssessmentSchema);
