const mongoose = require("mongoose");
const Student = require("../models/student.model");

/* ---------------------------------------------------------------------------
   Assessment models — every psychometric test a student can take.
   --------------------------------------------------------------------------- */
const AcademicAssessment = require("../models/psychometric/academicAssessment.model");
const MBTIAssessment = require("../models/psychometric/mbtiAssessment");
const CareerAssessment = require("../models/psychometric/careerAssessment.modal");
const RiasecAssessment = require("../models/psychometric/riasecAssessment.model");
const DishaAssessment = require("../models/psychometric/dishaAssessment.model");
const Disha2Assessment = require("../models/psychometric/disha2Assessment.model");
const Disha3Assessment = require("../models/psychometric/disha3Assessment.model");
const Disha4Assessment = require("../models/psychometric/disha4Assessment.model");
const Disha5Assessment = require("../models/psychometric/disha5Assessment.model");
const Disha6Assessment = require("../models/psychometric/disha6Assessment.model");
const Disha7Assessment = require("../models/psychometric/disha7Assessment.model");
const Disha8Assessment = require("../models/psychometric/disha8Assessment.model");
const DishaC10Assessment = require("../models/psychometric/dishaC10Assessment.model");
const DishaC12Assessment = require("../models/psychometric/dishaC12Assessment.model");

/**
 * TEST REGISTRY — the single source of truth for the admin psychometric
 * module. Every entry maps a stable URL-safe `key` to its Mongoose model plus
 * the display metadata the admin UI needs.
 *
 * `shape` tells the UI how the document stores its scoring output:
 *   "nested" — DISHA-era tests: a `result` object + a `responses` object.
 *   "flat"   — legacy tests (Academic/MBTI/Career/RIASEC): scoring lives in
 *              top-level fields (totalScore, dimensions, …) and `responses`
 *              is an array of per-question rows.
 *
 * `summaryFields` are the top-level document paths surfaced as the at-a-glance
 * chips in the student's test list, so the admin sees a headline score without
 * opening the full report.
 */
const TEST_REGISTRY = [
  {
    key: "academic",
    label: "Academic Self-Efficacy",
    group: "Core",
    model: AcademicAssessment,
    shape: "flat",
    summaryFields: ["totalScore", "percentage", "level"],
  },
  {
    key: "mbti",
    label: "MBTI Personality Type",
    group: "Core",
    model: MBTIAssessment,
    shape: "flat",
    summaryFields: ["mbti_type", "completionTimeSeconds"],
  },
  {
    key: "career",
    label: "Career Maturity",
    group: "Core",
    model: CareerAssessment,
    shape: "flat",
    summaryFields: ["totalScore", "percentage", "level"],
  },
  {
    key: "riasec",
    label: "RIASEC Interest Profile",
    group: "Core",
    model: RiasecAssessment,
    shape: "flat",
    summaryFields: ["interestCode", "totalScore", "percentage", "level"],
  },
  {
    key: "disha1",
    label: "DISHA Test 1 — Aptitude & Personality",
    group: "DISHA",
    model: DishaAssessment,
    shape: "nested",
  },
  {
    key: "disha2",
    label: "DISHA Test 2 — Interests & Work Values",
    group: "DISHA",
    model: Disha2Assessment,
    shape: "nested",
  },
  {
    key: "disha3",
    label: "DISHA Test 3 — Academic Performance & Learning Styles",
    group: "DISHA",
    model: Disha3Assessment,
    shape: "nested",
  },
  {
    key: "disha4",
    label: "DISHA Test 4 — Emotional Intelligence & Resilience",
    group: "DISHA",
    model: Disha4Assessment,
    shape: "nested",
  },
  {
    key: "disha5",
    label: "DISHA Test 5 — Future-Readiness & Adaptability",
    group: "DISHA",
    model: Disha5Assessment,
    shape: "nested",
  },
  {
    key: "disha6",
    label: "DISHA Test 6 — Creativity & Entrepreneurship",
    group: "DISHA",
    model: Disha6Assessment,
    shape: "nested",
  },
  {
    key: "disha7",
    label: "DISHA Test 7 — Leadership & Organisational Fit",
    group: "DISHA",
    model: Disha7Assessment,
    shape: "nested",
  },
  {
    key: "disha8",
    label: "DISHA Test 8 — Life Values & Lifestyle Fit",
    group: "DISHA",
    model: Disha8Assessment,
    shape: "nested",
  },
  {
    key: "dishac10",
    label: "DISHA Class 10 — Stream Selection",
    group: "DISHA Standalone",
    model: DishaC10Assessment,
    shape: "nested",
  },
  {
    key: "dishac12",
    label: "DISHA Class 12 — Career Selection",
    group: "DISHA Standalone",
    model: DishaC12Assessment,
    shape: "nested",
  },
];

const REGISTRY_BY_KEY = TEST_REGISTRY.reduce((acc, t) => {
  acc[t.key] = t;
  return acc;
}, {});

/** Registry metadata safe to send to the client (no Mongoose models). */
const PUBLIC_REGISTRY = TEST_REGISTRY.map(({ key, label, group }) => ({ key, label, group }));

class PsychometricAdminService {
  /**
   * Resolve the school scope for the requesting user.
   * School users (type "client") are restricted to their own school; platform
   * admins (type "superadmin") see every student. Returns `null` for the
   * unrestricted case, or a Mongoose ObjectId to filter on.
   */
  static resolveSchoolScope(authData) {
    const user = authData?.user || {};
    if (user.type === "client") {
      if (!user.schoolId) {
        const err = new Error("School context missing for this account");
        err.status = 403;
        throw err;
      }
      return new mongoose.Types.ObjectId(user.schoolId);
    }
    return null;
  }

  /**
   * Collect the distinct studentIds that appear in ANY assessment collection,
   * along with per-student counts and the most recent submission date.
   * Runs one lightweight distinct-style aggregation per collection in
   * parallel, then merges in memory — assessment volumes here are small
   * relative to the student roster, and this keeps the registry the only
   * place a new test has to be declared.
   */
  static async collectStudentTestIndex() {
    const perTest = await Promise.all(
      TEST_REGISTRY.map(async (test) => {
        const rows = await test.model.aggregate([
          {
            $group: {
              _id: "$studentId",
              lastSubmittedAt: { $max: { $ifNull: ["$submittedAt", "$updatedAt"] } },
              attempts: { $sum: 1 },
            },
          },
        ]);
        return { test, rows };
      })
    );

    // studentId (string) -> { testKeys:Set, lastSubmittedAt:Date, testCount }
    const index = new Map();
    for (const { test, rows } of perTest) {
      for (const row of rows) {
        if (!row._id) continue;
        const id = String(row._id);
        if (!index.has(id)) {
          index.set(id, { testKeys: new Set(), lastSubmittedAt: null });
        }
        const entry = index.get(id);
        entry.testKeys.add(test.key);
        if (row.lastSubmittedAt && (!entry.lastSubmittedAt || row.lastSubmittedAt > entry.lastSubmittedAt)) {
          entry.lastSubmittedAt = row.lastSubmittedAt;
        }
      }
    }
    return index;
  }

  /**
   * List students who have completed at least one psychometric test.
   * Supports a global keyword search (name, studentId, email, mobile, class,
   * section, roll number) and pagination.
   */
  static async getStudentsWithAssessments(req) {
    try {
      const schoolScope = PsychometricAdminService.resolveSchoolScope(req.authData);

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
      const keyword = (req.query.keyword || "").trim();

      const index = await PsychometricAdminService.collectStudentTestIndex();
      if (index.size === 0) {
        return {
          status: true,
          message: "No psychometric submissions found",
          data: { results: [], total: 0, page, limit, totalPages: 0, registry: PUBLIC_REGISTRY },
        };
      }

      const studentObjectIds = Array.from(index.keys()).map((id) => new mongoose.Types.ObjectId(id));

      const matchStage = { _id: { $in: studentObjectIds } };
      if (schoolScope) matchStage.schoolId = schoolScope;

      if (keyword) {
        const rx = { $regex: keyword, $options: "i" };
        matchStage.$or = [
          { studentId: rx },
          { "personalInfo.fullName": rx },
          { "contactInfo.studentEmail": rx },
          { "contactInfo.mobileNumber": rx },
          { "academicInfo.classGrade": rx },
          { "academicInfo.section": rx },
          { "academicInfo.rollNumber": rx },
        ];
      }

      const projection = {
        studentId: 1,
        schoolId: 1,
        "personalInfo.fullName": 1,
        "personalInfo.gender": 1,
        "academicInfo.classGrade": 1,
        "academicInfo.section": 1,
        "academicInfo.rollNumber": 1,
        "contactInfo.studentEmail": 1,
        "contactInfo.mobileNumber": 1,
        createdAt: 1,
      };

      const [students, total] = await Promise.all([
        Student.aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: "schools",
              localField: "schoolId",
              foreignField: "_id",
              as: "school",
            },
          },
          { $unwind: { path: "$school", preserveNullAndEmptyArrays: true } },
          { $project: { ...projection, "school.name": 1 } },
          { $sort: { "personalInfo.fullName": 1, _id: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]),
        Student.countDocuments(matchStage),
      ]);

      const results = students.map((s) => {
        const entry = index.get(String(s._id));
        const testKeys = entry ? Array.from(entry.testKeys) : [];
        return {
          ...s,
          schoolName: s.school?.name || null,
          testsTakenCount: testKeys.length,
          testKeys,
          lastSubmittedAt: entry?.lastSubmittedAt || null,
        };
      });

      return {
        status: true,
        message: "Students with psychometric assessments fetched successfully",
        data: {
          results,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          registry: PUBLIC_REGISTRY,
        },
      };
    } catch (error) {
      return {
        status: false,
        error: {
          status: error.status || 500,
          message: error.message || "Failed to fetch students with assessments",
        },
      };
    }
  }

  /**
   * For one student, return their profile plus the list of tests they have
   * completed (with a headline summary per test, and no heavy payloads).
   */
  static async getStudentAssessmentSummary(req) {
    try {
      const schoolScope = PsychometricAdminService.resolveSchoolScope(req.authData);
      const { studentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        const err = new Error("Invalid student id");
        err.status = 400;
        throw err;
      }

      const studentQuery = { _id: studentId };
      if (schoolScope) studentQuery.schoolId = schoolScope;

      const student = await Student.findOne(studentQuery)
        .select("-studentPassword -password")
        .populate("schoolId", "name")
        .lean();

      if (!student) {
        const err = new Error("Student not found or not accessible");
        err.status = 404;
        throw err;
      }

      const tests = await Promise.all(
        TEST_REGISTRY.map(async (test) => {
          const doc = await test.model
            .findOne({ studentId })
            .sort({ submittedAt: -1, updatedAt: -1 })
            .lean();
          if (!doc) return null;

          // Headline summary: DISHA tests expose result.summary; legacy tests
          // expose flat top-level score fields declared in the registry.
          let summary = null;
          if (test.shape === "nested") {
            summary = doc.result?.summary || null;
          } else if (test.summaryFields) {
            summary = test.summaryFields.reduce((acc, f) => {
              if (doc[f] !== undefined && doc[f] !== null) acc[f] = doc[f];
              return acc;
            }, {});
            if (Object.keys(summary).length === 0) summary = null;
          }

          return {
            key: test.key,
            label: test.label,
            group: test.group,
            shape: test.shape,
            submissionId: doc._id,
            submittedAt: doc.submittedAt || doc.updatedAt || doc.createdAt || null,
            attemptNumber: doc.attemptNumber || 1,
            completionTimeSeconds: doc.completionTimeSeconds || null,
            summary,
          };
        })
      );

      return {
        status: true,
        message: "Student assessment summary fetched successfully",
        data: {
          student,
          tests: tests.filter(Boolean),
          registry: PUBLIC_REGISTRY,
        },
      };
    } catch (error) {
      return {
        status: false,
        error: {
          status: error.status || 500,
          message: error.message || "Failed to fetch student assessment summary",
        },
      };
    }
  }

  /**
   * Full result + raw responses for one student's submission of one test.
   */
  static async getStudentTestReport(req) {
    try {
      const schoolScope = PsychometricAdminService.resolveSchoolScope(req.authData);
      const { studentId, testKey } = req.params;

      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        const err = new Error("Invalid student id");
        err.status = 400;
        throw err;
      }

      const test = REGISTRY_BY_KEY[testKey];
      if (!test) {
        const err = new Error("Unknown psychometric test");
        err.status = 404;
        throw err;
      }

      const studentQuery = { _id: studentId };
      if (schoolScope) studentQuery.schoolId = schoolScope;

      const student = await Student.findOne(studentQuery)
        .select("-studentPassword -password")
        .populate("schoolId", "name")
        .lean();

      if (!student) {
        const err = new Error("Student not found or not accessible");
        err.status = 404;
        throw err;
      }

      const doc = await test.model
        .findOne({ studentId })
        .sort({ submittedAt: -1, updatedAt: -1 })
        .lean();

      if (!doc) {
        const err = new Error("This student has not completed that test");
        err.status = 404;
        throw err;
      }

      // Normalise both storage shapes into one envelope the UI can render
      // generically, without the admin app needing per-test branching.
      const { _id, studentId: _sid, responses, result, __v, createdAt, updatedAt, ...rest } = doc;

      const normalised =
        test.shape === "nested"
          ? { result: result || null, responses: responses || null, extra: rest }
          : { result: rest, responses: responses || null, extra: {} };

      return {
        status: true,
        message: "Test report fetched successfully",
        data: {
          student,
          test: { key: test.key, label: test.label, group: test.group, shape: test.shape },
          submissionId: _id,
          submittedAt: doc.submittedAt || updatedAt || createdAt || null,
          attemptNumber: doc.attemptNumber || 1,
          completionTimeSeconds: doc.completionTimeSeconds || null,
          ...normalised,
        },
      };
    } catch (error) {
      return {
        status: false,
        error: {
          status: error.status || 500,
          message: error.message || "Failed to fetch test report",
        },
      };
    }
  }
}

module.exports = PsychometricAdminService;
module.exports.TEST_REGISTRY = TEST_REGISTRY;
module.exports.PUBLIC_REGISTRY = PUBLIC_REGISTRY;
