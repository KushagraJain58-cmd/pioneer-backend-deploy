const mongoose = require("mongoose");

/**
 * DISHA — Test 2 of 8: Interests, Work Values, Career Motivations &
 * Occupational Preferences. Stores the full multi-module submission plus the
 * computed result so the report can be regenerated without re-scoring. One
 * active record per student (latest attempt overwrites, attemptNumber
 * increments) — mirrors the Test-1 (DishaAssessment) model in this codebase.
 */
const Disha2AssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Optional context captured at the start of the test.
    profile: {
      currentClass: String, // Class 9 / 10 / 11 / 12 / Passed Class 12
      board: String,
      stream: String,
    },

    // ---- Raw responses, kept per module for transparency / re-scoring ----
    responses: {
      activities: { type: Map, of: Number }, // Module A { id: 1..5 }
      occupations: { type: Map, of: Number }, // Module B { id: 1..5 }
      workValuesLikert: { type: Map, of: Number }, // Module C part 1
      workValuesForcedChoice: { type: Map, of: String }, // Module C part 2 { id: "A"|"B" }
      valueRanking: [String], // Module C part 3 (ordered top→down, up to 5)
      motivations: { type: Map, of: Number }, // Module D { id: 1..5 }
      envSector: { type: Map, of: String }, // Module E sector FC { id: "A"|"B" }
      workStyle: { type: Map, of: Number }, // Module E bipolar { id: 1..5 }
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // Module F { id: { mostLikely, leastLikely } }
    },

    // ---- Computed result (output of the Test-2 scoring engine) ----
    result: {
      riasec: mongoose.Schema.Types.Mixed, // { scores:[...], hollandCode, consistency }
      workValues: mongoose.Schema.Types.Mixed, // { valueScores, ranked, topValues, familyCongruent }
      motivations: mongoose.Schema.Types.Mixed, // { motivationScores, intrinsic, extrinsic, gap, ... }
      environment: mongoose.Schema.Types.Mixed, // { sectorPrefs, style, filter }
      sjt: mongoose.Schema.Types.Mixed, // { percentage, competencies, breakdown }
      summary: mongoose.Schema.Types.Mixed, // { overall, pillars, preliminary }
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha2Assessment", Disha2AssessmentSchema);
