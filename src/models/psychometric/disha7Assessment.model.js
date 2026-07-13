const mongoose = require("mongoose");

/**
 * DISHA — Test 7 of 8: Leadership Potential, Management Aptitude, Teamwork
 * Skills & Organisational Fit. Stores the full multi-section submission plus
 * the computed result so the report can be regenerated without re-scoring.
 * One active record per student (latest attempt overwrites, attemptNumber
 * increments) — mirrors the Test-1..6 models. No class restriction: T7 is part
 * of the general numbered battery, available to all students (Classes 9–12).
 */
const Disha7AssessmentSchema = new mongoose.Schema(
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
      leadershipPotential: { type: Map, of: Number }, // Section A { id: 1..5 }
      managementSkills: { type: Map, of: Number }, // Section B
      teamwork: { type: Map, of: Number }, // Section C likert
      teamworkFc: { type: Map, of: String }, // Section C FC { pairId: "A"|"B" }
      powerOrientation: { type: Map, of: Number }, // Section D
      ethicalLeadership: { type: Map, of: Number }, // Section E
      workCulture: { type: Map, of: Number }, // Section F likert
      workCultureFc: { type: Map, of: String }, // Section F FC
      leadershipFc: { type: Map, of: String }, // Section G FC
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed }, // Blocks H + I
      validity: { type: Map, of: Number }, // LikeMe items
    },

    // ---- Computed result (output of the Test-7 scoring engine) ----
    result: {
      leadership: mongoose.Schema.Types.Mixed, // Section A sub-scales
      management: mongoose.Schema.Types.Mixed,
      teamwork: mongoose.Schema.Types.Mixed, // Belbin team roles
      power: mongoose.Schema.Types.Mixed, // Power Orientation profile
      ethical: mongoose.Schema.Types.Mixed, // Ethical Leadership + threshold
      workCulture: mongoose.Schema.Types.Mixed, // Org Fit profile
      leadershipFc: mongoose.Schema.Types.Mixed, // FC tally + signals
      sjt: mongoose.Schema.Types.Mixed,
      lpi: mongoose.Schema.Types.Mixed, // Leadership Potential Index + band
      style: mongoose.Schema.Types.Mixed, // Leadership Style + role model
      validity: mongoose.Schema.Types.Mixed,
      criticalFlags: mongoose.Schema.Types.Mixed,
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha7Assessment", Disha7AssessmentSchema);
