const mongoose = require("mongoose");

/**
 * DISHA — Test 8 of 8 (Capstone): Long-term Life Values, Work-Life Balance,
 * Lifestyle Goals & Career Satisfaction Predictors. Stores the full
 * multi-section submission plus the computed result so the report can be
 * regenerated without re-scoring. One active record per student (latest
 * attempt overwrites, attemptNumber increments) — mirrors the Test-1..7
 * models. No class restriction: T8 is part of the general numbered battery,
 * available to all students (Classes 9–12).
 *
 * GP-5 (the Non-Negotiable) and the LD open-ended items are stored verbatim
 * — per the source document, these are never summarised algorithmically and
 * must remain available to the counsellor in full.
 */
const Disha8AssessmentSchema = new mongoose.Schema(
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
      lifeValues: { type: Map, of: Number }, // Section A { id: 1..5 }
      lifeValuesRanking: { type: Map, of: Number }, // { valueKey: rank 1-5 }
      wlbPreferences: { type: Map, of: Number }, // Section B
      wlbFc: { type: Map, of: String }, // Section B FC { pairId: "A"|"B" }
      lifestyleGoals: { type: Map, of: Number }, // Section C likert
      lifeDesignOpen: { type: Map, of: String }, // Section C open-ended (LD1-5)
      moneyMindset: { type: Map, of: Number }, // Section D
      moneyFc: { type: Map, of: String }, // Section D FC
      socialContribution: { type: Map, of: Number }, // Section E
      satisfactionPredictors: { type: Map, of: Number }, // Section F
      futureProjectionSliders: { type: Map, of: Number }, // Section G element -> spectrum index
      gp5: { type: Map, of: String }, // GP5_good / GP5_wasted, verbatim
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // Section H { scenarioId: { mostLikely } }
      validity: { type: Map, of: Number }, // LikeMe items
    },

    // ---- Computed result (output of the Test-8 scoring engine) ----
    result: {
      lifeValues: mongoose.Schema.Types.Mixed, // 10 dimension scores + top5/top3 ranking
      wlb: mongoose.Schema.Types.Mixed, // WLB Index + Family-Career Integration
      lifestyle: mongoose.Schema.Types.Mixed, // geographic/income/family-structure profile + open LD responses
      money: mongoose.Schema.Types.Mixed, // Money Profile
      purpose: mongoose.Schema.Types.Mixed, // Seva vs PersonalSuccess vs Integration
      spi: mongoose.Schema.Types.Mixed, // Satisfaction Prediction Index
      futureProjection: mongoose.Schema.Types.Mixed, // GP1-4 slider profile + GP-5 verbatim
      sjt: mongoose.Schema.Types.Mixed, // values-alignment scoring
      validity: mongoose.Schema.Types.Mixed,
      regretRisk: mongoose.Schema.Types.Mixed, // Career Regret Prevention (T8-computable factors)
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha8Assessment", Disha8AssessmentSchema);
