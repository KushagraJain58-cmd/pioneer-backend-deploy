const mongoose = require("mongoose");

/**
 * DISHA — Test 5 of 8: Career Adaptability, Decision-Making Style, Growth
 * Mindset, Learning Agility & Future-Readiness. Stores the full multi-section
 * submission plus the computed result so the report can be regenerated without
 * re-scoring. One active record per student (latest attempt overwrites,
 * attemptNumber increments) — mirrors the Test-1/2/3/4 models in this codebase.
 */
const Disha5AssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    profile: {
      currentClass: String,
      board: String,
    },

    // ---- Raw responses, kept per section for transparency / re-scoring ----
    responses: {
      adaptability: { type: Map, of: Number }, // Section A (4Cs) { id: 1..5 }
      mindset: { type: Map, of: Number }, // Section B
      decisionStyle: { type: Map, of: Number }, // Section C
      learningAgility: { type: Map, of: Number }, // Section D
      ambiguityRisk: { type: Map, of: Number }, // Section E
      futureOrientation: { type: Map, of: Number }, // Section F
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // Blocks G + H { id: { mostLikely, leastLikely } }
      validity: { type: Map, of: Number }, // LikeMe items
    },

    // ---- Computed result (output of the Test-5 scoring engine) ----
    result: {
      adaptability: mongoose.Schema.Types.Mixed, // 4Cs + overall + band
      mindset: mongoose.Schema.Types.Mixed, // growth index + fixed flags
      decisionStyle: mongoose.Schema.Types.Mixed, // 4 styles + flags
      learningAgility: mongoose.Schema.Types.Mixed,
      ambiguityRisk: mongoose.Schema.Types.Mixed, // risk-stability profile
      futureOrientation: mongoose.Schema.Types.Mixed,
      sjt: mongoose.Schema.Types.Mixed,
      validity: mongoose.Schema.Types.Mixed,
      quadrant: mongoose.Schema.Types.Mixed, // 2x2 adaptability profile
      summary: mongoose.Schema.Types.Mixed, // future-readiness index
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha5Assessment", Disha5AssessmentSchema);
