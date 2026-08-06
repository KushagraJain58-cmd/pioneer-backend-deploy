const express = require("express");
const { verifyToken } = require('../utils/utils.accessToken');
const UniversityController = require('../controllers/university.controller');
const router = express.Router();

router.post('/',verifyToken,UniversityController.createUniversity);
router.get('/',verifyToken,UniversityController.getUniversity);
router.put('/:id',verifyToken,UniversityController.updateUniversity);
router.delete('/:id',verifyToken,UniversityController.deleteUniversity);

module.exports = router;