const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const School = require('../models/school.model')
const SchoolUser = require('../models/schoolUser.model')
const Student = require("../models/student.model")
const StudentCounter = require("../models/studentCounter.model")
const Subject = require("../models/subject.model");
const { createAuditLog } = require('../utils/auditLogger');
const EncryptAndDecrypt = require("../utils/utils.encryptAndDecrypt");
const AccessToken = require("../utils/utils.accessToken");
const mongoose = require("mongoose");
const generatePassword = require("../utils/generatePassword");
const bcrypt = require("bcrypt");
const xlsx = require("xlsx");
const StudentAcademicRecord = require("../models/studentAcademic.model")
const generateSchoolCode = require("../utils/generateSchoolCode");

// Student ID prefix from the school's name, e.g. "St. Marks" -> "SM"
function getStudentIdPrefix(school) {
  return generateSchoolCode(school?.name) || school?.schoolCode || "SCH";
}

function buildStudentId(prefix, classGrade, year, roll) {
  return `${prefix}-${String(classGrade).trim()}-${year}-${String(roll).trim()}`;
}

// Next auto roll number for a class whose Student ID is not already taken
async function nextFreeRoll(schoolId, prefix, classGrade, year, reserved = new Set()) {
  while (true) {
    const counter = await StudentCounter.findOneAndUpdate(
      { schoolId, classGrade: String(classGrade).trim(), year },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );
    const roll = String(counter.sequence).padStart(3, "0");
    const studentId = buildStudentId(prefix, classGrade, year, roll);
    if (reserved.has(studentId)) continue;
    if (!(await Student.exists({ studentId }))) return roll;
  }
}

const FIXED_COLUMNS = [
  "Student ID",
  "Student Name",
  "Academic Year",
  "Class",
  "Section",
  "Exam Type"
];

/**
 * Normalise a portal-access input into an array of valid portals.
 * Accepts:
 *   - an array like ["main"], ["neet"], ["main","neet"]
 *   - a string "main" | "neet" | "both" | "main,neet"
 * Falls back to ["main"] when empty/invalid.
 */
function normalizePortalAccess(input) {
  const VALID = ["main", "neet"];
  let list = [];
  if (Array.isArray(input)) {
    list = input;
  } else if (typeof input === "string" && input.trim()) {
    const v = input.trim().toLowerCase();
    if (v === "both") list = ["main", "neet"];
    else list = v.split(/[,|]/);
  }
  const cleaned = [
    ...new Set(list.map((p) => String(p).trim().toLowerCase()).filter((p) => VALID.includes(p)))
  ];
  return cleaned.length ? cleaned : ["main"];
}

class StudentService {
//   static async createStudent(payload) {
//     try {
//       const { user } = payload.authData;

//       /* ----------------------------------
//       1. AUTHORIZATION
//       -----------------------------------*/
//       if (user.role !== "SCHOOL_ADMIN") {
//         throw Forbidden("You are not allowed to create students");
//       }

//       const schoolId = user.schoolId;
//       if (!schoolId) {
//         throw Forbidden("School context missing");
//       }

//       /* ----------------------------------
//       2. REQUEST BODY
//       -----------------------------------*/
//       const {
//         personalInfo,
//         academicInfo,
//         addressInfo,
//         contactInfo,
//         familyInfo
//       } = payload.body;

//       if (!personalInfo?.fullName) {
//         throw Forbidden("Student full name is required");
//       }

//       /* ----------------------------------
//       3. DUPLICATE CHECKS
//       -----------------------------------*/
//       if (academicInfo?.rollNumber) {
//         const existingRoll = await Student.findOne({
//           "academicInfo.rollNumber": academicInfo.rollNumber,
//           schoolId
//         });

//         if (existingRoll) {
//           throw Forbidden("Roll number already exists in this school");
//         }
//       }

//       if (contactInfo?.studentEmail) {
//         const existingEmail = await Student.findOne({
//           "contactInfo.studentEmail": contactInfo.studentEmail
//         });

//         if (existingEmail) {
//           throw Forbidden("Student email already exists");
//         }
//       }

//       if (familyInfo?.parentMobile) {
//         const existingParentMobile = await Student.findOne({
//           "familyInfo.parentMobile": familyInfo.parentMobile
//         });

//         if (existingParentMobile) {
//           throw Forbidden("Parent mobile already exists");
//         }
//       }

//       /* ----------------------------------
//       4. CREATE STUDENT
//       -----------------------------------*/
//       const student = await Student.create({
//         schoolId,
//         personalInfo,
//         academicInfo,
//         addressInfo,
//         contactInfo,
//         familyInfo,
//         createdBy: user._id
//       });

//       if (!student) {
//         throw InternalServerError("Unable to create student");
//       }

//       /* ----------------------------------
//       5. SANITIZE RESPONSE
//       -----------------------------------*/
//       const studentResponse = student.toObject();

//       /* ----------------------------------
//       6. AUDIT LOG
//       -----------------------------------*/
//       await createAuditLog({
//         userId: user._id,
//         userName: `${user.firstName} ${user.lastName}`,
//         userRole: user.role,
//         action: "STUDENT_CREATED",
//         details: `Student ${personalInfo.fullName} created in school ${schoolId}`
//       });

//       /* ----------------------------------
//       7. RESPONSE
//       -----------------------------------*/
//       return {
//         status: true,
//         data: studentResponse,
//         message: "Student created successfully",
//         error: null
//       };
//     } catch (error) {
//       return {
//         status: false,
//         data: null,
//         message: error.message,
//         error
//       };
//     }
//   }

  static async loginEmailOrPhone(req) {
      try {
          const { email, phone, password, studentId } = req.body;
          console.log(" req.body", req.body)
          let clientUser;
          if(studentId){
            clientUser = await Student.findOne({ studentId });
          }
          else if (phone) {
              clientUser = await Student.findOne({ phone });
          }
          if(!clientUser){
            clientUser = await Student.findOne({email:studentId });
          }
          if (!clientUser) {
              throw Unauthorized("clientUser does not exist");
          }

          // if (!clientUser?.isActive) {
          //     throw Unauthorized("This account is suspended.");
          // }

          /* ----------------------------------
             PORTAL ACCESS CHECK
             Each frontend sends `portal` ("main" | "neet"). A student may only
             log into a portal they've been granted access to. Existing students
             without the field default to "main" only.
          -----------------------------------*/
          const requestedPortal = req.body.portal;
          if (requestedPortal) {
              const access = Array.isArray(clientUser.portalAccess) && clientUser.portalAccess.length
                  ? clientUser.portalAccess
                  : ["main"];
              if (!access.includes(requestedPortal)) {
                  throw Forbidden(
                      requestedPortal === "neet"
                          ? "You do not have access to the Pioneer NEET portal. Please contact your school."
                          : "You do not have access to this portal. Please contact your school."
                  );
              }
          }

          let isverified = false;
          if (phone) {
              isverified = true;
          } else if (email || studentId) {
              // isverified = await bcrypt.compare(password, clientUser.password);
              isverified = true;
          }

          if (!isverified) {
              throw Unauthorized("Email Or Password do not match");
          }

          clientUser.password = undefined;
          let _clientUser = clientUser._doc;
          _clientUser.type = "student";
          const token = AccessToken.generateAccessToken(clientUser);

          if (clientUser?.profileImageLink?.key) {

              const params = {
                  Bucket: process.env.BUCKET,
                  Key: clientUser.profileImageLink.key
              };

              const command = new GetObjectCommand(params);
              let accessKeyId = process.env.ACCESS_KEY;
              let secretAccessKey = process.env.ACCESS_SECRET;
              const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
              let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });
              _clientUser.profileImageLink.publicUrl = getUrl;
          }

          if (process.env.CLIENT_TWO_FACTOR_LOGIN === 'true' && phone) {

              console.log("generating otp >>>>>>>>>>");
              const OTP = await crypto.randomInt(1000, 9999);

              console.log("OTP >>>>>>>>>>", OTP);
              const twilioResponse = await sendSMS(`One Time Password: ${OTP}`, clientUser.phone);

              if (clientUser.phone) {
                  await Student.updateOne({ phone: clientUser.phone }, { $set: { otpObject: { otp: OTP, createdAt: new Date() } } });
              } else if (clientUser.email) {
                  await Student.updateOne({ email: clientUser.email }, { $set: { otpObject: { otp: OTP, createdAt: new Date() } } });
              }

              return {
                  status: true,
                  data: null,
                  message: "OTP sent on registered mobile number",
                  error: null
              };
          }
          return {
              status: true,
              data: {
                  clientUser,
                  token
              },
              message: "Login successfully",
              error: null
          };
      } catch (error) {
          return {
              status: false,
              data: null,
              message: error.message,
              error
          };
      }
  }

  static async createStudent(payload) {
    try {
      const { user } = payload.authData;

      if (user.role !== "SCHOOL_ADMIN") {
        throw Forbidden("You are not allowed to create students");
      }

      const schoolId = user.schoolId;
      if (!schoolId) throw Forbidden("School context missing");

      const {
        personalInfo,
        academicInfo,
        addressInfo,
        contactInfo,
        familyInfo,
        portalAccess
      } = payload.body;

      if (!academicInfo?.classGrade) {
        throw Forbidden("Class is required");
      }

      const normalizedPortalAccess = normalizePortalAccess(portalAccess);

      /* ----------------------------------
      1. GENERATE STUDENT ID
      -----------------------------------*/
      const year = new Date().getFullYear();

      const school = await School.findById(schoolId);
      if (!school) throw Forbidden("School not found");
      const prefix = getStudentIdPrefix(school);

      let roll = academicInfo.rollNumber ? String(academicInfo.rollNumber).trim() : "";
      if (roll) {
        const taken = await Student.exists({
          studentId: buildStudentId(prefix, academicInfo.classGrade, year, roll)
        });
        if (taken) {
          throw Forbidden(`Roll number ${roll} is already used in class ${academicInfo.classGrade}`);
        }
      } else {
        roll = await nextFreeRoll(schoolId, prefix, academicInfo.classGrade, year);
      }

      const studentId = buildStudentId(prefix, academicInfo.classGrade, year, roll);

      /* ----------------------------------
      2. GENERATE PASSWORD
      -----------------------------------*/
      const plainPassword = generatePassword(8);
      const saltRounds = parseInt(process.env.BCRYPT_SALT);
      const encryptedPassword = EncryptAndDecrypt.encrypt(plainPassword);

      /* ----------------------------------
      3. CREATE STUDENT
      -----------------------------------*/
      const student = await Student.create({
        studentId,
        schoolId,
        studentPassword: encryptedPassword,
        portalAccess: normalizedPortalAccess,
        personalInfo,
        academicInfo: { ...academicInfo, rollNumber: roll },
        addressInfo,
        contactInfo,
        familyInfo,
        createdBy: user._id
      });

      /* ----------------------------------
      4. RESPONSE (SEND PASSWORD ONCE)
      -----------------------------------*/
      const response = student.toObject();
      response.generatedPassword = plainPassword; // send once

      delete response.auth;

      return {
        status: true,
        data: response,
        message: "Student created successfully",
        error: null
      };

    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message,
        error
      };
    }
  }

  static async uploadStudentsSheet(req) {
    try {
      const { user } = req.authData;

      if (user.role !== "SCHOOL_ADMIN") {
        throw Forbidden("You are not allowed to upload students");
      }

      const schoolId = user.schoolId;
      if (!schoolId) {
        throw Forbidden("School context missing");
      }

      if (!req.file) {
        throw Unauthorized("Student sheet file is required");
      }

      /* ----------------------------------
      1. FETCH SCHOOL
      -----------------------------------*/
      const school = await School.findById(schoolId);
      if (!school) {
        throw Forbidden("School not found");
      }

      /* ----------------------------------
      2. READ EXCEL / CSV
      -----------------------------------*/
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = xlsx.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: true
      });

      if (!rows.length) {
        throw Unauthorized("Student sheet is empty");
      }

      /* ----------------------------------
      3. MAP ROWS → STUDENT DOCS
      -----------------------------------*/
      const saltRounds = parseInt(process.env.BCRYPT_SALT);

      const studentsToInsert = [];
      const credentials = []; // optional: return passwords once

      // Batch-level portal access (from the upload form) — applied to every row
      // unless a row overrides it with a "Portal Access" column.
      const batchPortalAccess = normalizePortalAccess(req.body?.portalAccess);

      const prefix = getStudentIdPrefix(school);
      const year = new Date().getFullYear();
      const validRows = rows.filter((row) => row["Full Name"] && row["Class"]);

      // Check roll numbers given in the sheet against each other and the DB
      const reserved = new Set();
      const duplicates = [];
      for (const row of validRows) {
        if (row["Roll Number"] == null || String(row["Roll Number"]).trim() === "") continue;
        const id = buildStudentId(prefix, row["Class"], year, row["Roll Number"]);
        if (reserved.has(id)) duplicates.push(`${id} (repeated in sheet)`);
        reserved.add(id);
      }
      const existing = await Student.find({ studentId: { $in: [...reserved] } }, { studentId: 1 }).lean();
      existing.forEach((s) => duplicates.push(`${s.studentId} (already exists)`));
      if (duplicates.length) {
        throw Forbidden(`Duplicate class/roll numbers: ${duplicates.join(", ")}`);
      }

      for (const row of validRows) {
        const plainPassword = generatePassword(8);
        const encryptedPassword = EncryptAndDecrypt.encrypt(plainPassword);

        let roll = row["Roll Number"] == null ? "" : String(row["Roll Number"]).trim();
        if (!roll) {
          roll = await nextFreeRoll(schoolId, prefix, row["Class"], year, reserved);
          reserved.add(buildStudentId(prefix, row["Class"], year, roll));
        }

        // const counter = await StudentCounter.findOneAndUpdate(
        //   {
        //     schoolId,
        //     classGrade: academicInfo.classGrade,
        //     year
        //   },
        //   { $inc: { sequence: 1 } },
        //   { new: true, upsert: true }
        // );

        // const schoolCode = user.schoolCode || "SCH"; // store in School later
        // const sequence = String(counter.sequence).padStart(4, "0");

        // const studentId = `${schoolCode}-${academicInfo.classGrade}-${year}-${sequence}`;
        
        const studentId = buildStudentId(prefix, row["Class"], year, roll);

        studentsToInsert.push({
          studentId,
          schoolId,
          studentPassword:encryptedPassword,
          portalAccess: row["Portal Access"]
            ? normalizePortalAccess(row["Portal Access"])
            : batchPortalAccess,
          personalInfo: {
            fullName: row["Full Name"],
            dateOfBirth: row["Date of Birth"]
              ? new Date(row["Date of Birth"])
              : null,
            gender: row["Gender"] || "Male"
          },

          academicInfo: {
            classGrade: row["Class"],
            section: row["Section"] || null,
            rollNumber: roll
          },

          addressInfo: {
            state: row["State"] || null,
            city: row["City"] || null,
            address: row["Address"] || null
          },

          contactInfo: {
            mobileNumber: row["Mobile Number"] || null,
            studentEmail: row["Student Email"] || null
          },

          familyInfo: {
            fatherName: row["Father Name"] || null,
            motherName: row["Mother Name"] || null,
            guardianName: row["Guardian Name"] || null,
            parentMobile: row["Parent Mobile"] || null,
            parentEmail: row["Parent Email"] || null,
            parentOccupation: row["Parent Occupation"] || null
          },

          createdBy: user._id
        });

        credentials.push({
          studentId,
          password: plainPassword
        });

      }

      if (!studentsToInsert.length) {
        throw Unauthorized("No valid student rows found");
      }

      /* ----------------------------------
      4. BULK INSERT
      -----------------------------------*/
      const insertedStudents = await Student.insertMany(studentsToInsert, {
        ordered: false
      });

      return {
        status: true,
        data: {
          students: insertedStudents,
          credentials // ⚠️ return once (optional)
        },
        message: "Students uploaded successfully",
        error: null
      };

    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message,
        error
      };
    }
  }

  static async getStudents(payload) {
    try {
      const { user } = payload.authData;
      console.log("user",user)
      /* ----------------------------------
        1. AUTHORIZATION
      -----------------------------------*/

      if (user.role !== "SCHOOL_ADMIN") {
        throw Forbidden("You are not allowed to view school users");
      }

      const schoolId = new mongoose.Types.ObjectId(user.schoolId);
      if (!schoolId) {
        throw Forbidden("School context missing");
      }

      /* ----------------------------------
        2. QUERY PARAMS
      -----------------------------------*/

      const {
        page = 1,
        limit = 10,
        keyword,
      } = payload.query || {};

      const skip = (Number(page) - 1) * Number(limit);

      /* ----------------------------------
        3. MATCH CONDITIONS
      -----------------------------------*/

      const matchStage = {
        schoolId
      };
      if (keyword) {
        matchStage.$or = [
          { "personalInfo.fullName": { $regex: keyword, $options: "i" } },
          { "contactInfo.studentEmail": { $regex: keyword, $options: "i" } },
          { "academicInfo.rollNumber": { $regex: keyword, $options: "i" } },
          { studentId: { $regex: keyword, $options: "i" } },
          { role: { $regex: keyword, $options: "i" } }
        ];
      }
      /* ----------------------------------
        4. AGGREGATION PIPELINE
      -----------------------------------*/

      const pipeline = [
        { $match: matchStage },

        {
          $project: {
            password: 0 
          }
        },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
      ];

      /* ----------------------------------
        5. EXECUTE QUERY
      -----------------------------------*/

      const [users, total] = await Promise.all([
        Student.aggregate(pipeline),
        Student.countDocuments(matchStage)
      ]);

      /* ----------------------------------
        6. RESPONSE
      -----------------------------------*/

      return {
        status: true,
        data: users,
        total,
        message: "School users fetched successfully",
        error: null
      };

    } catch (error) {
      return {
        status: false,
        data: null,
        total: 0,
        message: error.message || "Unable to fetch students",
        error
      };
    }
  }

  static async getStudentDetails(payload) {
  try {
    const { user } = payload.authData;
    const { studentId } = payload.params;

    /* ----------------------------------
      1. AUTHORIZATION
    -----------------------------------*/

    if (user.role !== "SCHOOL_ADMIN") {
      throw Forbidden("You are not allowed to view student details");
    }

    const schoolId = new mongoose.Types.ObjectId(user.schoolId);
    if (!schoolId) {
      throw Forbidden("School context missing");
    }

    if (!studentId) {
      throw BadRequest("Student ID is required");
    }

    /* ----------------------------------
      2. FIND STUDENT (SECURE)
    -----------------------------------*/

    const student = await Student.findOne({
      studentId,
      schoolId,
    }).select("-password");

    if (!student) {
      throw NotFound("Student not found");
    }
    console.log("student",student)
    try {
      student.studentPassword = student.studentPassword
        ? EncryptAndDecrypt.decrypt(student.studentPassword)
        : "";
    } catch (e) {
      student.studentPassword = "";
    }

    console.log("student UPdated",student)

    /* ----------------------------------
      3. RESPONSE
    -----------------------------------*/

    return {
      status: true,
      data: student,
      message: "Student details fetched successfully",
      error: null,
    };

  } catch (error) {
    return {
      status: false,
      data: null,
      message: error.message || "Unable to fetch student details",
      error,
    };
  }
}

  static async updateStudent(payload) {
    try {
      const { user } = payload.authData;
      const { studentId } = payload.params;

      /* ----------------------------------
        1. AUTHORIZATION
      -----------------------------------*/
      if (user.role !== "SCHOOL_ADMIN") {
        throw Forbidden("You are not allowed to update students");
      }

      const schoolId = new mongoose.Types.ObjectId(user.schoolId);
      if (!schoolId) {
        throw Forbidden("School context missing");
      }

      /* ----------------------------------
        2. FIND STUDENT (SECURE)
      -----------------------------------*/
      const student = await Student.findOne({ studentId, schoolId });
      if (!student) {
        throw Forbidden("Student not found");
      }

      /* ----------------------------------
        3. APPLY UPDATES (merge, not replace)
      -----------------------------------*/
      const {
        personalInfo,
        academicInfo,
        addressInfo,
        contactInfo,
        familyInfo,
        portalAccess,
        password
      } = payload.body;

      if (personalInfo) {
        student.personalInfo = { ...student.personalInfo?.toObject?.(), ...personalInfo };
      }
      if (academicInfo) {
        student.academicInfo = { ...student.academicInfo?.toObject?.(), ...academicInfo };
      }
      if (addressInfo) {
        student.addressInfo = { ...student.addressInfo?.toObject?.(), ...addressInfo };
      }
      if (contactInfo) {
        student.contactInfo = { ...student.contactInfo?.toObject?.(), ...contactInfo };
      }
      if (familyInfo) {
        student.familyInfo = { ...student.familyInfo?.toObject?.(), ...familyInfo };
      }
      if (portalAccess) {
        student.portalAccess = normalizePortalAccess(portalAccess);
      }
      if (password) {
        if (String(password).length < 6) {
          throw Forbidden("Password must be at least 6 characters");
        }
        student.studentPassword = EncryptAndDecrypt.encrypt(String(password));
      }

      await student.save();

      /* ----------------------------------
        4. RESPONSE (decrypt so the admin UI can show it right away)
      -----------------------------------*/
      const response = student.toObject();
      response.studentPassword = password ? String(password) : EncryptAndDecrypt.decrypt(student.studentPassword);

      return {
        status: true,
        data: response,
        message: "Student updated successfully",
        error: null
      };

    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message || "Unable to update student",
        error
      };
    }
  }


  // static async uploadMarks(req) {
  //   try {
  //     const { user } = req.authData;

  //     if (user.role !== "SCHOOL_ADMIN") {
  //       throw Forbidden("You are not allowed to upload marks");
  //     }

  //     const schoolId = user.schoolId;
  //     if (!schoolId) {
  //       throw Forbidden("School context missing");
  //     }

  //     if (!req.file) {
  //       throw Unauthorized("Marks sheet file is required");
  //     }

  //     /* ----------------------------------
  //        1. READ EXCEL
  //     -----------------------------------*/
  //     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];

  //     const rows = xlsx.utils.sheet_to_json(worksheet, {
  //       defval: null,
  //       raw: true
  //     });
  //     if (!rows.length) {
  //       throw Unauthorized("Marks sheet is empty");
  //     }

  //     /* ----------------------------------
  //        2. MAP ROWS → ACADEMIC RECORDS
  //     -----------------------------------*/
  //     const recordsToInsert = [];

  //     for (const row of rows) {
  //       if (!row["Student ID"] || !row["Class"] || !row["Exam Type"]) continue;
  //       console.log(`row["Student ID"]`,row["Student ID"])
  //       const student = await Student.findOne({
  //         studentId: row["Student ID"],
  //       });
  //       if (!student) continue;

  //       const subjectColumns = Object.keys(row).filter(
  //         col => !FIXED_COLUMNS.includes(col)
  //       );

  //       if (!subjectColumns.length) continue;

  //       const subjects = [];
  //       let totalMarks = 0;
  //       let maxTotalMarks = 0;
  //       let hasFail = false;

  //       // for (const subjectName of subjectColumns) {
  //       //   const subject = await Subject.findOne({
  //       //     schoolId,
  //       //     classGrade: row["Class"],
  //       //     name: subjectName.trim()
  //       //   });
  //       //   if (!subject) {
  //       //     throw Unauthorized(`Subject not found: ${subjectName}`);
  //       //   }

  //       //   const marksObtained = Number(row[subjectName]) || 0;

  //       //   if (marksObtained > subject.maxMarks) {
  //       //     throw Unauthorized(
  //       //       `Marks exceed max marks for ${subjectName}`
  //       //     );
  //       //   }

  //       //   totalMarks += marksObtained;
  //       //   maxTotalMarks += subject.maxMarks;

  //       //   if (marksObtained < subject.maxMarks * 0.33) {
  //       //     hasFail = true;
  //       //   }

  //       //   subjects.push({
  //       //     subjectId: subject._id,
  //       //     subjectName: subject.name,
  //       //     maxMarks: subject.maxMarks,
  //       //     marksObtained
  //       //   });
  //       //   console.log("subjects",subjects)
  //       // }
  //       for (const subjectName of subjectColumns) {
  //         const trimmedName = subjectName.trim();

  //         const subject = await Subject.findOneAndUpdate(
  //           {
  //             schoolId,
  //             classGrade: row["Class"],
  //             name: trimmedName
  //           },
  //           {
  //             $setOnInsert: {
  //               schoolId,
  //               classGrade: row["Class"],
  //               name: trimmedName,
  //               maxMarks: 100,      
  //               isOptional: false
  //             }
  //           },
  //           {
  //             new: true,
  //             upsert: true
  //           }
  //         );

  //         const marksObtained = Number(row[subjectName]) || 0;

  //         if (marksObtained > subject.maxMarks) {
  //           throw Unauthorized(
  //             `Marks exceed max marks for ${trimmedName}`
  //           );
  //         }

  //         totalMarks += marksObtained;
  //         maxTotalMarks += subject.maxMarks;
  //         console.log("marksObtained",marksObtained)
  //         console.log("subject.maxMarks",subject.maxMarks)
  //         if (marksObtained < subject.maxMarks * 0.33) {
  //           hasFail = true;
  //         }

  //         subjects.push({
  //           subjectId: subject._id,
  //           subjectName: subject.name,
  //           maxMarks: subject.maxMarks,
  //           marksObtained
  //         });
  //       }
  //       recordsToInsert.push({
  //         studentId: student._id,
  //         schoolId,
  //         academicYear: row["Academic Year"],
  //         classGrade: row["Class"],
  //         section: row["Section"] || null,
  //         exam: {
  //           name: row["Exam Type"],
  //           type: row["Exam Type"]
  //         },
  //         subjects,
  //         totalMarks,
  //         maxTotalMarks,
  //         percentage: Number(
  //           ((totalMarks / maxTotalMarks) * 100).toFixed(2)
  //         ),
  //         resultStatus: hasFail ? "FAIL" : "PASS",
  //         createdBy: user._id
  //       });
  //     }

  //     if (!recordsToInsert.length) {
  //       throw Unauthorized("No valid academic records found");
  //     }

  //     /* ----------------------------------
  //        3. BULK INSERT
  //     -----------------------------------*/
  //     const insertedRecords =
  //       await StudentAcademicRecord.insertMany(recordsToInsert, {
  //         ordered: false
  //       });

  //     return {
  //       status: true,
  //       data: {
  //         records: insertedRecords,
  //         count: insertedRecords.length
  //       },
  //       message: "Marks uploaded successfully",
  //       error: null
  //     };

  //   } catch (error) {
  //     return {
  //       status: false,
  //       data: null,
  //       message: error.message,
  //       error
  //     };
  //   }
  // }

  static async uploadMarks(req) {
  try {
    const { user } = req.authData;

    if (user.role !== "SCHOOL_ADMIN") {
      throw Forbidden("You are not allowed to upload marks");
    }

    const schoolId = user.schoolId;
    if (!schoolId) {
      throw Forbidden("School context missing");
    }

    if (!req.file) {
      throw Unauthorized("Marks sheet file is required");
    }

    /* ----------------------------------
       1. READ EXCEL
    -----------------------------------*/
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: true
    });

    if (!rows.length) {
      throw Unauthorized("Marks sheet is empty");
    }

    /* ----------------------------------
       2. PROCESS ROWS
    -----------------------------------*/
    const recordsToInsert = [];

    for (const row of rows) {
      if (!row["Student ID"] || !row["Class"] || !row["Exam Type"]) continue;

      const student = await Student.findOne({
        studentId: row["Student ID"]
      });

      if (!student) continue;

      const subjectColumns = Object.keys(row).filter(
        col => !FIXED_COLUMNS.includes(col)
      );

      if (!subjectColumns.length) continue;

      let totalMarks = 0;
      let maxTotalMarks = 0;
      let hasFail = false;
      const subjects = [];

      for (const subjectName of subjectColumns) {
        const trimmedName = subjectName.trim();

        // const subject = await Subject.findOneAndUpdate(
        //   {
        //     schoolId,
        //     classGrade: row["Class"],
        //     name: trimmedName
        //   },
        //   {
        //     $setOnInsert: {
        //       schoolId,
        //       classGrade: row["Class"],
        //       name: trimmedName,
        //       maxMarks: 100,
        //       isOptional: false
        //     }
        //   },
        //   { new: true, upsert: true }
        // );

        const marksObtained = Number(row[subjectName]) || 0;
        const maxMarks=100

        if (marksObtained > maxMarks) {
          throw Unauthorized(
            `Marks exceed max marks for ${trimmedName}`
          );
        }

        totalMarks += marksObtained;
        maxTotalMarks += maxMarks;

        if (marksObtained < maxMarks * 0.33) {
          hasFail = true;
        }

        subjects.push({
          academicYear: row["Academic Year"],
          subjectName,
          maxMarks,
          marksObtained
        });
      }

      const percentage = Number(
        ((totalMarks / maxTotalMarks) * 100).toFixed(2)
      );

      const resultStatus = hasFail ? "FAIL" : "PASS";

      /* ----------------------------------
         3. INSERT ACADEMIC RECORD
      -----------------------------------*/
      recordsToInsert.push({
        studentId: student.studentId,
        schoolId,
        academicYear: row["Academic Year"],
        classGrade: row["Class"],
        section: row["Section"] || null,
        exam: {
          name: row["Exam Type"],
          type: row["Exam Type"]
        },
        subjects,
        totalMarks,
        maxTotalMarks,
        percentage,
        resultStatus,
        createdBy: user._id
      });

      /* ----------------------------------
         4. UPSERT INTO STUDENT.examResults
      -----------------------------------*/
      const examResultPayload = {
        examType: row["Exam Type"],
        academicYear: row["Academic Year"],
        totalMarks,
        maxTotalMarks,
        percentage,
        resultStatus
      };

      const updateResult = await Student.updateOne(
        {
          _id: student._id,
          "examResults.examType": examResultPayload.examType,
          "examResults.academicYear": examResultPayload.academicYear
        },
        {
          $set: {
            "examResults.$": examResultPayload
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        await Student.updateOne(
          { _id: student._id },
          {
            $push: {
              examResults: examResultPayload
            }
          }
        );
      }
    }

    if (!recordsToInsert.length) {
      throw Unauthorized("No valid academic records found");
    }
    console.log("recordsToInsert",recordsToInsert)
    /* ----------------------------------
       5. BULK INSERT
    -----------------------------------*/
    const insertedRecords =
      await StudentAcademicRecord.insertMany(recordsToInsert, {
        ordered: true
      });

    return {
      status: true,
      data: {
        records: insertedRecords,
        count: insertedRecords.length
      },
      message: "Marks uploaded successfully",
      error: null
    };

  } catch (error) {
    return {
      status: false,
      data: null,
      message: error.message,
      error
    };
  }
}


  static async getStudentMarks(payload) {
  try {
    const { user } = payload.authData;
    const { studentId } = payload.params || {};
    const { academicYear, examType } = payload.query || {};

    /* ----------------------------------
      1. AUTHORIZATION & VALIDATION
    -----------------------------------*/

    if (!user || user.role !== "SCHOOL_ADMIN") {
      throw Forbidden("You are not allowed to view student marks");
    }

    if (!studentId) {
      throw BadRequest("Student ID is required");
    }

    if (!user.schoolId) {
      throw Forbidden("School context missing");
    }

    const schoolId = new mongoose.Types.ObjectId(user.schoolId);
    const normalizedStudentId = String(studentId).trim();

    /* ----------------------------------
      2. BUILD MATCH QUERY
    -----------------------------------*/

    const matchStage = {
      studentId: normalizedStudentId,
      schoolId,
    };

    if (academicYear) {
      matchStage.academicYear = academicYear;
    }

    if (examType) {
      matchStage["exam.type"] = examType;
    }

    /* ----------------------------------
      3. AGGREGATION PIPELINE
    -----------------------------------*/

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
    ];

    const records = await StudentAcademicRecord.aggregate(pipeline);

    if (!records || records.length === 0) {
      throw NotFound("No academic records found for this student");
    }

    /* ----------------------------------
      4. RESPONSE
    -----------------------------------*/

    return {
      status: true,
      data: records,
      message: "Student academic records fetched successfully",
      error: null,
    };

  } catch (error) {
    console.error("getStudentMarks error:", error);

    return {
      status: false,
      data: null,
      message: error.message || "Unable to fetch student marks",
      error,
    };
  }
}


  static async getSelfProfile(req) {
    try {
      const { user } = req.authData;

      const student = await Student.findById(user._id).select("-studentPassword");
      if (!student) {
        throw new Error("Student not found");
      }

      return {
        status: true,
        data: student,
        message: "Profile fetched successfully",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message || "Unable to fetch profile",
        error,
      };
    }
  }

  static async updateSelfProfile(req) {
    try {
      const { user } = req.authData;
      const { personalInfo, addressInfo, contactInfo, familyInfo } = req.body;

      const updated = await Student.findByIdAndUpdate(
        user._id,
        {
          $set: {
            ...(personalInfo && { personalInfo }),
            ...(addressInfo && { addressInfo }),
            ...(contactInfo && { contactInfo }),
            ...(familyInfo && { familyInfo }),
          },
        },
        { new: true, runValidators: true }
      ).select("-studentPassword");

      if (!updated) {
        throw new Error("Student not found");
      }

      return {
        status: true,
        data: updated,
        message: "Profile updated successfully",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message || "Unable to update profile",
        error,
      };
    }
  }

  static async changeOwnPassword(req) {
    try {
      const { user } = req.authData;
      const { currentPassword, newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      const student = await Student.findById(user._id);
      if (!student) {
        throw new Error("Student not found");
      }

      if (currentPassword) {
        const decrypted = EncryptAndDecrypt.decrypt(student.studentPassword);
        if (decrypted !== currentPassword) {
          throw new Error("Current password is incorrect");
        }
      }

      const encryptedPassword = EncryptAndDecrypt.encrypt(newPassword);
      const saltRounds = parseInt(process.env.BCRYPT_SALT) || 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await Student.findByIdAndUpdate(user._id, {
        $set: { studentPassword: encryptedPassword }
      });

      return {
        status: true,
        data: null,
        message: "Password changed successfully",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.message || "Unable to change password",
        error,
      };
    }
  }

}

module.exports = StudentService;