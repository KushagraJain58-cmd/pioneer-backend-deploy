const mongoose = require("mongoose");

/**
 * DISHA — Class 12 Career Selection Test. A standalone assessment (not part
 * of the numbered Test 1–8 battery) restricted to students currently in
 * Class 12, producing Top 12 career recommendations, entrance-exam
 * probability, college-pathway categories, and a 5-year vision. Stores the
 * full submission plus the computed result so the report can be regenerated
 * without re-scoring. One active record per student (latest attempt
 * overwrites, attemptNumber increments).
 */
const DishaC12AssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    profile: {
      classGrade: String, // snapshot of academicInfo.classGrade at submission time
    },

    // ---- Raw responses, kept per section for transparency / re-scoring ----
    responses: {
      class10Marks: { type: Map, of: mongoose.Schema.Types.Mixed }, // { subjectKey: {obtained,maximum} }
      class11Marks: { type: Map, of: mongoose.Schema.Types.Mixed }, // { slotKey: {obtained,maximum,label} }
      class12Marks: { type: Map, of: mongoose.Schema.Types.Mixed }, // { slotKey: {obtained,maximum,predicted,label} }
      attemptedScores: { type: Map, of: mongoose.Schema.Types.Mixed }, // { examKey: { value, label } }
      aptitude: { type: Map, of: mongoose.Schema.Types.Mixed }, // { id: { selected, hintUsed } }
      personality: { type: Map, of: Number },
      interests: { type: Map, of: Number },
      careerAppeal: { type: Map, of: Number },
      values: { type: Map, of: Number },
      motivations: { type: Map, of: Number },
      lifeDesign: {
        metroPreference: Number,
        autonomyIn5Years: Number,
        incomeAspiration: Number,
        familyPresence: Number,
        orgType: String,
        geoExpectation: String,
        workingStyle: String,
        riskTolerance: Number,
      },
      context: {
        parentPreference: Number,
        financialUrgency: Number,
        geographicConstraint: Number,
        secretInterest: String, // counsellor-only
        careerClarity: String,
        targetExam: [String],
        financialSituation: String,
        roleModelName: String,
        roleModelAdmire: String,
      },
      scenarios: { type: Map, of: String },
    },

    // ---- Computed result (output of the Class-12 scoring engine) ----
    result: {
      academic: mongoose.Schema.Types.Mixed,
      aptitude: mongoose.Schema.Types.Mixed,
      personality: mongoose.Schema.Types.Mixed,
      interests: mongoose.Schema.Types.Mixed,
      valuesMotivations: mongoose.Schema.Types.Mixed,
      lifeDesign: mongoose.Schema.Types.Mixed,
      context: mongoose.Schema.Types.Mixed,
      scenarios: mongoose.Schema.Types.Mixed,
      recommendations: mongoose.Schema.Types.Mixed, // top 12 careers
      examProbabilities: mongoose.Schema.Types.Mixed,
      collegePathways: mongoose.Schema.Types.Mixed,
      fiveYearVision: mongoose.Schema.Types.Mixed,
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DishaC12Assessment", DishaC12AssessmentSchema);
