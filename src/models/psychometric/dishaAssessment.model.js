const mongoose = require("mongoose");

/**
 * DISHA — Differential Intelligence & Scholastic Horizon Assessment (Test 1 of 8).
 * Stores the full multi-module submission plus the computed result so the report
 * can be regenerated without re-scoring. One active record per student (latest
 * attempt overwrites, attemptNumber increments) — mirrors the other psychometric
 * assessments in this codebase.
 */
const DishaAssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Class-adaptive / norm-table context captured from Module 1 supplementary Qs.
    profile: {
      currentClass: String, // Class 9 / 10 / 11 / 12 / Passed Class 12
      board: String, // CBSE / ICSE / IB / State / Other
      competitiveExam: String, // JEE / NEET / CLAT / ...
    },

    // ---- Raw responses, kept per module for transparency / re-scoring ----
    responses: {
      aptitude: { type: Map, of: mongoose.Schema.Types.Mixed }, // { questionId: optionIndex | count | text }
      personality: { type: Map, of: Number }, // OCEAN + validity likert (1..5)
      riasecForcedChoice: { type: Map, of: String }, // { id: "A"|"B" }
      riasecLikert: { type: Map, of: Number },
      workValuesLikert: { type: Map, of: Number },
      workValuesForcedChoice: { type: Map, of: String },
      ics: { type: Map, of: mongoose.Schema.Types.Mixed },
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // { scenarioId: { mostLikely, leastLikely } }
      academicMarks: [
        {
          subjectKey: String,
          terms: { type: Map, of: mongoose.Schema.Types.Mixed },
          enjoyment: Number,
        },
      ],
      supplementary: { type: Map, of: mongoose.Schema.Types.Mixed },
    },

    // ---- Computed result (output of the scoring engine) ----
    result: {
      aptitude: mongoose.Schema.Types.Mixed, // { dimensions:[{dim,raw,tScore,zone}], averageT }
      personality: mongoose.Schema.Types.Mixed, // { O:{...}, C:{...}, ... }
      riasec: mongoose.Schema.Types.Mixed, // { scores:[...], hollandCode }
      workValues: mongoose.Schema.Types.Mixed,
      sjt: mongoose.Schema.Types.Mixed,
      academic: mongoose.Schema.Types.Mixed, // SSI per subject + composite
      validity: mongoose.Schema.Types.Mixed, // flags + scales (counsellor-facing)
      ccre: mongoose.Schema.Types.Mixed, // pillar scores + overall fit (preliminary)
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DishaAssessment", DishaAssessmentSchema);
