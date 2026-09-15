const Responses = require("../utils/utils.response");
const CounsellorService = require("../services/counsellor.service");

const handle = (serviceFn) => async (req, res) => {
    try {
        const { status, error, message, data } = await serviceFn(req);
        if (status) {
            res.status(200).json(Responses.successResponse(message, data));
        } else {
            res.status(error?.status || 400).json(Responses.errorResponse(error));
        }
    } catch (error) {
        res.status(400).json(Responses.errorResponse(error));
    }
};

class CounsellorController {
    static createCounsellor = handle(CounsellorService.createCounsellor);
    static getCounsellors = handle(CounsellorService.getCounsellors);
    static getCounsellorById = handle(CounsellorService.getCounsellorById);
    static updateCounsellor = handle(CounsellorService.updateCounsellor);
    static deleteCounsellor = handle(CounsellorService.deleteCounsellor);
}

module.exports = CounsellorController;
