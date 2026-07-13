const mongoose = require("mongoose");

/**
 * DISHA — Test 3 of 8: Academic Performance Analysis, Subject Strengths,
 * Learning Styles & Study Habits. Stores the full multi-section submission plus
 * the computed result so the report can be regenerated without re-scoring. One
 * active record per student (latest attempt overwrites, attemptNumber
 * increments) — mirrors the Test-1 / Test-2 models in this codebase.
 *
 * NOTE: marks are the most sensitive data in the battery. They are stored only
 * for the student's own report generation and personalised recommendations.
 */
const Disha3AssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // Intake / configuration context.
    profile: {
      currentClass: String,
      board: String,
      stream: String,
      appearedBoard: String, // M-INT-04
      coaching: String, // M-INT-05
      marksVerified: { type: Boolean, default: false }, // marksheet uploaded
    },

    // ---- Raw responses, kept per section for transparency / re-scoring ----
    responses: {
      // Section 1
      marks: { type: Map, of: mongoose.Schema.Types.Mixed }, // { subjectKey: { terms: { termKey: { obtained, maximum } } } }
      previousMarks: { type: Map, of: mongoose.Schema.Types.Mixed }, // optional trend data
      marksSupplementary: { type: Map, of: mongoose.Schema.Types.Mixed },
      // Section 2
      proficiency: { type: Map, of: mongoose.Schema.Types.Mixed }, // { subjectKey: { comfort, enjoyment } }
      subjectIdentity: { type: Map, of: mongoose.Schema.Types.Mixed }, // { SP-xx: value }
      // Section 3
      learningStyles: { type: Map, of: Number },
      learningStyleFc: { type: Map, of: String },
      // Section 4
      studyHabits: { type: Map, of: Number },
      // Section 5
      examPrep: { type: Map, of: Number },
      // Section 6
      sjt: { type: Map, of: mongoose.Schema.Types.Mixed },
      // Validity
      validity: { type: Map, of: Number },
    },

    // ---- Computed result (output of the Test-3 scoring engine) ----
    result: {
      marks: mongoose.Schema.Types.Mixed, // { subjects:[{subjectKey,ssi,tScore,zone,...}], aps, ... }
      proficiency: mongoose.Schema.Types.Mixed, // self-efficacy gaps
      learningStyles: mongoose.Schema.Types.Mixed, // VARK + flags
      studyHabits: mongoose.Schema.Types.Mixed, // sub-scales + amotivation flag
      examPrep: mongoose.Schema.Types.Mixed, // sub-scales + anxiety risk
      sjt: mongoose.Schema.Types.Mixed,
      streams: mongoose.Schema.Types.Mixed, // stream probability list
      examProbabilities: mongoose.Schema.Types.Mixed,
      validity: mongoose.Schema.Types.Mixed,
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disha3Assessment", Disha3AssessmentSchema);
