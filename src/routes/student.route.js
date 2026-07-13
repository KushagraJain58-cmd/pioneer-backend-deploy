const PreVerify = require('../utils/preVerify_user_client')
const StudentController = require('../controllers/student.controller');
const User = require('../modules/user/user.model');
const Pagination = require('../utils/utils.pagination');
const fileUpload = require("../utils/utils.uploadUserProfile");
var multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userDataValidation = require('../modules/user/user.validation');
const express = require("express");
const { verifyToken } = require('../utils/utils.accessToken');
const router = express.Router();

router.post('/login',StudentController.studentEmailPhoneLogin);

router.post('/',verifyToken,StudentController.studentCreate);

router.get('/',verifyToken,StudentController.getStudents);

router.get('/profile/me',verifyToken,StudentController.getSelfProfile);
router.put('/profile/me',verifyToken,StudentController.updateSelfProfile);
router.put('/profile/me/password',verifyToken,StudentController.changeOwnPassword);

router.get('/:studentId',verifyToken,StudentController.getStudentDetails);

router.post('/uploadSheet',verifyToken,upload.single('csvFile'),StudentController.uploadStudentsSheet);

router.post('/uploadMarks',verifyToken,upload.single('csvFile'),StudentController.uploadMarksSheet);

router.get('/getStudentMarks/:studentId',verifyToken,StudentController.getStudentMarks);

module.exports = router;