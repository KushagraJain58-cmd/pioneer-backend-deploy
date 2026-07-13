const mongoose = require("mongoose");

/**
 * DISHA — Test 4 of 8: Emotional Intelligence, Resilience, Stress Management &
 * Interpersonal Fit. Stores the full multi-section submission plus the computed
 * result so the report can be regenerated without re-scoring. One active record
 * per student (latest attempt overwrites, attemptNumber increments) — mirrors
 * the Test-1/2/3 models in this codebase.
 *
 * NOTE: T4 does not diagnose mental-health conditions. Emotional / crisis flags
 * are counsellor-facing wellbeing signals, not clinical judgements.
 */
const Disha4AssessmentSchema = new mongoose.Schema(
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
      selfAwareness: { type: Map, of: Number }, // Section A { id: 1..5 }
      selfRegulation: { type: Map, of: Number }, // Section B
      resilience: { type: Map, of: Number }, // Section C
      empathy: { type: Map, of: Number }, // Section D
      adaptability: { type: Map, of: Number }, // Section E
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // Blocks F + G { id: { mostLikely, leastLikely } }
      validity: { type: Map, of: Number }, // LikeMe items
      crisisSelfCheck: Number, // 1..5 (special handling)
    },

    // ---- Computed result (output of the Test-4 scoring engine) ----
    result: {
      selfAwareness: mongoose.Schema.Types.Mixed,
      selfRegulation: mongoose.Schema.Types.Mixed, // + impulsivity flag
      resilience: mongoose.Schema.Types.Mixed, // resilience/grit/growth + index + flags
      empathy: mongoose.Schema.Types.Mixed, // sub-scales + over-involvement flag
      adaptability: mongoose.Schema.Types.Mixed, // sub-scales + geo filter
      sjt: mongoose.Schema.Types.Mixed, // competencies + crisis flag
      validity: mongoose.Schema.Types.Mixed,
      overall: mongoose.Schema.Types.Mixed, // EQ T-score + band
      flags: mongoose.Schema.Types.Mixed, // wellbeing / counsellor flags
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha4Assessment", Disha4AssessmentSchema);
