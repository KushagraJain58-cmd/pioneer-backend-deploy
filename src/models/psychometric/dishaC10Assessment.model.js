const mongoose = require("mongoose");

/**
 * DISHA — Class 10 Stream Selection Test. A standalone assessment (not part of
 * the numbered Test 1–8 battery) restricted to students currently in Class 10,
 * recommending a stream for Class 11 (Science PCM, Science PCB, Commerce +
 * Maths, Commerce, Humanities). Stores the full submission plus the computed
 * result so the report can be regenerated without re-scoring. One active
 * record per student (latest attempt overwrites, attemptNumber increments).
 */
const DishaC10AssessmentSchema = new mongoose.Schema(
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
      marks: { type: Map, of: mongoose.Schema.Types.Mixed }, // { subjectKey: { terms: { termKey: {obtained,maximum} } } }
      enjoyment: { type: Map, of: Number }, // { subjectKey: 1..5 }
      inTheZoneSubject: String,
      aptitude: { type: Map, of: mongoose.Schema.Types.Mixed }, // { id: { selected, hintUsed } }
      interests: { type: Map, of: Number }, // { id: 1..5 }
      values: { type: Map, of: Number }, // { id: 1..5 }
      streamPreference: { type: Map, of: String }, // { pairId: "A"|"B" }
      context: {
        parentPreference: Number,
        financialUrgency: Number,
        geographicConstraint: Number,
        decisionStatus: String,
        examTargets: [String],
        secretInterest: String, // counsellor-only
      },
      scenarios: { type: Map, of: String }, // { scenarioId: "A"|"B"|"C"|"D" }
    },

    // ---- Computed result (output of the Class-10 scoring engine) ----
    result: {
      academic: mongoose.Schema.Types.Mixed,
      aptitude: mongoose.Schema.Types.Mixed,
      interests: mongoose.Schema.Types.Mixed,
      values: mongoose.Schema.Types.Mixed,
      streamPreference: mongoose.Schema.Types.Mixed,
      context: mongoose.Schema.Types.Mixed,
      scenarios: mongoose.Schema.Types.Mixed,
      streams: mongoose.Schema.Types.Mixed, // [{ stream, label, probability }]
      examReadiness: mongoose.Schema.Types.Mixed,
      summary: mongoose.Schema.Types.Mixed,
    },

    attemptNumber: { type: Number, default: 1 },
    completionTimeSeconds: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DishaC10Assessment", DishaC10AssessmentSchema);
