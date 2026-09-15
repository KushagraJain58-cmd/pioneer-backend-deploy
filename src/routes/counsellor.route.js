const express = require("express");
const multer = require("multer");
const { verifyToken } = require('../utils/utils.accessToken');
const CounsellorController = require("../controllers/counsellor.controller");
const Responses = require("../utils/utils.response");
const router = express.Router();

// Optional single profile image, kept in memory and pushed to S3 by the service
const profileImageUpload = (req, res, next) => {
    multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const ok = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname) && file.mimetype.startsWith("image/");
            cb(ok ? null : new Error("Only jpg, jpeg, png or webp images are allowed"), ok);
        }
    }).single("profileImage")(req, res, (err) => {
        if (err) return res.status(400).json(Responses.errorResponse(err));
        next();
    });
};

router.post('/', verifyToken, profileImageUpload, CounsellorController.createCounsellor);
router.get('/', verifyToken, CounsellorController.getCounsellors);
router.get('/:id', verifyToken, CounsellorController.getCounsellorById);
router.put('/:id', verifyToken, profileImageUpload, CounsellorController.updateCounsellor);
router.delete('/:id', verifyToken, CounsellorController.deleteCounsellor);

module.exports = router;
