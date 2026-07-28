const express = require("express");
const { verifyToken } = require('../utils/utils.accessToken');
const router = express.Router();
const PsychometricController = require('../controllers/psychometric.controller');

router.get('/academicQuestions',verifyToken,PsychometricController.getAcademicQuestions);
router.post('/academicAssessment',verifyToken,PsychometricController.submitAssessment);
router.get('/academicResult/:id',verifyToken,PsychometricController.getAcademicResult);

router.post('/mbtiAssessment',verifyToken,PsychometricController.submitMBTIAssessment);
router.get('/mbtiResult/:id',verifyToken,PsychometricController.getMBTIResult);

router.get('/careerQuestions',verifyToken,PsychometricController.getCareerQuestions);
router.post('/careerAssessment',verifyToken,PsychometricController.submitCareerAssessment);
router.get('/careerResult/:id',verifyToken,PsychometricController.getCareerResult);

router.get('/riasecQuestions',verifyToken,PsychometricController.getRiasecQuestions);
router.post('/riasecAssessment',verifyToken,PsychometricController.submitRiasecAssessment);
router.get('/riasecResult/:id',verifyToken,PsychometricController.getRiasecResult);

// DISHA — Differential Intelligence & Scholastic Horizon Assessment (Test 1 of 8)
router.get('/dishaQuestions',verifyToken,PsychometricController.getDishaQuestions);
router.post('/dishaAssessment',verifyToken,PsychometricController.submitDishaAssessment);
router.get('/dishaResult/:id',verifyToken,PsychometricController.getDishaResult);

// DISHA Test 2 — Interests, Work Values, Career Motivations & Occupational Preferences
router.get('/disha2Questions',verifyToken,PsychometricController.getDisha2Questions);
router.post('/disha2Assessment',verifyToken,PsychometricController.submitDisha2Assessment);
router.get('/disha2Result/:id',verifyToken,PsychometricController.getDisha2Result);

// DISHA Test 3 — Academic Performance, Subject Strengths, Learning Styles & Study Habits
router.get('/disha3Questions',verifyToken,PsychometricController.getDisha3Questions);
router.post('/disha3Assessment',verifyToken,PsychometricController.submitDisha3Assessment);
router.get('/disha3Result/:id',verifyToken,PsychometricController.getDisha3Result);

// DISHA Test 4 — Emotional Intelligence, Resilience, Stress Management & Interpersonal Fit
router.get('/disha4Questions',verifyToken,PsychometricController.getDisha4Questions);
router.post('/disha4Assessment',verifyToken,PsychometricController.submitDisha4Assessment);
router.get('/disha4Result/:id',verifyToken,PsychometricController.getDisha4Result);

// DISHA Test 5 — Career Adaptability, Decision-Making Style, Growth Mindset, Learning Agility & Future-Readiness
router.get('/disha5Questions',verifyToken,PsychometricController.getDisha5Questions);
router.post('/disha5Assessment',verifyToken,PsychometricController.submitDisha5Assessment);
router.get('/disha5Result/:id',verifyToken,PsychometricController.getDisha5Result);

// DISHA Class 10 Stream Selection Test — standalone, restricted to Class 10 students
router.get('/dishaC10Questions',verifyToken,PsychometricController.getDishaC10Questions);
router.post('/dishaC10Assessment',verifyToken,PsychometricController.submitDishaC10Assessment);
router.get('/dishaC10Result/:id',verifyToken,PsychometricController.getDishaC10Result);

// DISHA Class 12 Career Selection Test — standalone, restricted to Class 12 students
router.get('/dishaC12Questions',verifyToken,PsychometricController.getDishaC12Questions);
router.post('/dishaC12Assessment',verifyToken,PsychometricController.submitDishaC12Assessment);
router.get('/dishaC12Result/:id',verifyToken,PsychometricController.getDishaC12Result);

// DISHA Test 6 — Creative Thinking, Innovation Mindset, Entrepreneurial Potential & Problem-Solving Style
router.get('/disha6Questions',verifyToken,PsychometricController.getDisha6Questions);
router.post('/disha6Assessment',verifyToken,PsychometricController.submitDisha6Assessment);
router.get('/disha6Result/:id',verifyToken,PsychometricController.getDisha6Result);

// DISHA Test 7 — Leadership Potential, Management Aptitude, Teamwork Skills & Organisational Fit
router.get('/disha7Questions',verifyToken,PsychometricController.getDisha7Questions);
router.post('/disha7Assessment',verifyToken,PsychometricController.submitDisha7Assessment);
router.get('/disha7Result/:id',verifyToken,PsychometricController.getDisha7Result);

// DISHA Test 8 — Long-term Life Values, Work-Life Balance, Lifestyle Goals & Career Satisfaction Predictors (Capstone)
router.get('/disha8Questions',verifyToken,PsychometricController.getDisha8Questions);
router.post('/disha8Assessment',verifyToken,PsychometricController.submitDisha8Assessment);
router.get('/disha8Result/:id',verifyToken,PsychometricController.getDisha8Result);

/* ------------------------------------------------------------------
   ADMIN — psychometric reporting for the admin/school dashboard.
   Students who have taken at least one test, their test list, and the
   full result + responses for any single test.
   ------------------------------------------------------------------ */
router.get('/admin/students',verifyToken,PsychometricController.getPsychometricStudents);
router.get('/admin/students/:studentId',verifyToken,PsychometricController.getPsychometricStudentSummary);
router.get('/admin/students/:studentId/tests/:testKey',verifyToken,PsychometricController.getPsychometricStudentTestReport);


module.exports = router;