const StudentController = require('../controllers/student.controller');
var multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const express = require("express");
const { verifyToken } = require('../utils/utils.accessToken');
const CareerController = require('../controllers/career.controller');
const router = express.Router();

router.post('/',verifyToken,CareerController.createCareer);
router.get('/',verifyToken,CareerController.getCareer);

/* Industries — declared before /:id so they are not swallowed by it */
router.get('/industries',verifyToken,CareerController.getIndustries);
router.post('/industries',verifyToken,CareerController.createIndustry);
router.put('/industries/:id',verifyToken,CareerController.updateIndustry);
router.delete('/industries/:id',verifyToken,CareerController.deleteIndustry);

router.put('/:id',verifyToken,CareerController.updateCareer);
router.delete('/:id',verifyToken,CareerController.deleteCareer);

module.exports = router;