const Responses = require("../utils/utils.response");
const PsychometricService = require("../services/psychometric.service")
const PsychometricAdminService = require("../services/psychometricAdmin.service")


class PsychometricController {
    static async getAcademicQuestions(req, res) {
        try {
            const result = await PsychometricService.getAcademicQuestions(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }
    static async submitAssessment(req, res) {
        try {
            const result = await PsychometricService.submitAssessment(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async getAcademicResult(req, res) {
        try {
            const result = await PsychometricService.getAcademicResult(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async submitMBTIAssessment(req, res) {
        try {
            const result = await PsychometricService.submitMBTIAssessment(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async getMBTIResult(req, res) {
        try {
            const result = await PsychometricService.getMBTIResult(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async getCareerQuestions(req, res) {
        try {
            const result = await PsychometricService.getCareerQuestions(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async submitCareerAssessment(req, res) {
        try {
            const result = await PsychometricService.submitCareerAssessment(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async getCareerResult(req, res) {
        try {
            const result = await PsychometricService.getCareerResult(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async getRiasecQuestions(req, res) {
        try {
            const result = await PsychometricService.getRiasecQuestions(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async submitRiasecAssessment(req, res) {
        try {
            const result = await PsychometricService.submitRiasecAssessment(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    static async getRiasecResult(req, res) {
        try {
            const result = await PsychometricService.getRiasecResult(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(401).json(Responses.errorResponse(error))
        }
    }

    /* ===================== DISHA (Test 1 of 8) ===================== */

    static async getDishaQuestions(req, res) {
        try {
            const result = await PsychometricService.getDishaQuestions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDishaAssessment(req, res) {
        try {
            const result = await PsychometricService.submitDishaAssessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDishaResult(req, res) {
        try {
            const result = await PsychometricService.getDishaResult(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 2 of 8) ===================== */

    static async getDisha2Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha2Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha2Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha2Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha2Result(req, res) {
        try {
            const result = await PsychometricService.getDisha2Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 3 of 8) ===================== */

    static async getDisha3Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha3Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha3Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha3Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha3Result(req, res) {
        try {
            const result = await PsychometricService.getDisha3Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 4 of 8) ===================== */

    static async getDisha4Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha4Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha4Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha4Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha4Result(req, res) {
        try {
            const result = await PsychometricService.getDisha4Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 5 of 8) ===================== */

    static async getDisha5Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha5Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha5Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha5Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha5Result(req, res) {
        try {
            const result = await PsychometricService.getDisha5Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Class 10 Stream Selection Test) ===================== */

    static async getDishaC10Questions(req, res) {
        try {
            const result = await PsychometricService.getDishaC10Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDishaC10Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDishaC10Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDishaC10Result(req, res) {
        try {
            const result = await PsychometricService.getDishaC10Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Class 12 Career Selection Test) ===================== */

    static async getDishaC12Questions(req, res) {
        try {
            const result = await PsychometricService.getDishaC12Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDishaC12Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDishaC12Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDishaC12Result(req, res) {
        try {
            const result = await PsychometricService.getDishaC12Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 6 of 8) ===================== */

    static async getDisha6Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha6Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha6Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha6Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha6Result(req, res) {
        try {
            const result = await PsychometricService.getDisha6Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 7 of 8) ===================== */

    static async getDisha7Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha7Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha7Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha7Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha7Result(req, res) {
        try {
            const result = await PsychometricService.getDisha7Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ===================== DISHA (Test 8 of 8 — Capstone) ===================== */

    static async getDisha8Questions(req, res) {
        try {
            const result = await PsychometricService.getDisha8Questions(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async submitDisha8Assessment(req, res) {
        try {
            const result = await PsychometricService.submitDisha8Assessment(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    static async getDisha8Result(req, res) {
        try {
            const result = await PsychometricService.getDisha8Result(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(401).json(Responses.errorResponse(error));
        }
    }

    /* ==================================================================
       ADMIN — psychometric reporting across all students and all tests.
       Consumed by the pioneer-admin dashboard. School users are scoped to
       their own school; platform admins see every student.
       ================================================================== */

    static async getPsychometricStudents(req, res) {
        try {
            const result = await PsychometricAdminService.getStudentsWithAssessments(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 400).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(500).json(Responses.errorResponse(error));
        }
    }

    static async getPsychometricStudentSummary(req, res) {
        try {
            const result = await PsychometricAdminService.getStudentAssessmentSummary(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 400).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(500).json(Responses.errorResponse(error));
        }
    }

    static async getPsychometricStudentTestReport(req, res) {
        try {
            const result = await PsychometricAdminService.getStudentTestReport(req);
            const { status, error, message, data } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 400).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(500).json(Responses.errorResponse(error));
        }
    }

}

module.exports = PsychometricController;
