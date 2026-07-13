const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const mongoose = require("mongoose");
const AcademicQuestion = require("../models/psychometric/academicQuestions.model");
const CareerQuestion = require("../models/psychometric/careerQuestions.modal")
const RiasecQuestion = require("../models/psychometric/riasecQuestions.model")
const AcademicAssessment = require("../models/psychometric/academicAssessment.model");
const CareerAssessment = require("../models/psychometric/careerAssessment.modal");
const MBTIAssessment = require("../models/psychometric/mbtiAssessment");
const RiasecAssessment = require("../models/psychometric/riasecAssessment.model");
const calculateScore = require("../config/psychometric/calculateScore");
const getOverallLevel = require("../config/psychometric/getOverallLevel");
const getDimensionLevel = require("../config/psychometric/getDimensionLevel");
const dimensionConfig = require("../config/psychometric/dimensionConfig");
const DishaBank = require("../config/psychometric/disha/questions");
const DishaScoring = require("../config/psychometric/disha/scoring");
const DishaAssessment = require("../models/psychometric/dishaAssessment.model");
const Disha2Bank = require("../config/psychometric/disha2/questions");
const Disha2Scoring = require("../config/psychometric/disha2/scoring");
const Disha2Assessment = require("../models/psychometric/disha2Assessment.model");
const Disha3Bank = require("../config/psychometric/disha3/questions");
const Disha3Scoring = require("../config/psychometric/disha3/scoring");
const Disha3Assessment = require("../models/psychometric/disha3Assessment.model");
const Disha4Bank = require("../config/psychometric/disha4/questions");
const Disha4Scoring = require("../config/psychometric/disha4/scoring");
const Disha4Assessment = require("../models/psychometric/disha4Assessment.model");
const Disha5Bank = require("../config/psychometric/disha5/questions");
const Disha5Scoring = require("../config/psychometric/disha5/scoring");
const Disha5Assessment = require("../models/psychometric/disha5Assessment.model");
const DishaC10Bank = require("../config/psychometric/dishac10/questions");
const DishaC10Scoring = require("../config/psychometric/dishac10/scoring");
const DishaC10Assessment = require("../models/psychometric/dishaC10Assessment.model");
const DishaC12Bank = require("../config/psychometric/dishac12/questions");
const DishaC12Scoring = require("../config/psychometric/dishac12/scoring");
const DishaC12Assessment = require("../models/psychometric/dishaC12Assessment.model");
const Disha6Bank = require("../config/psychometric/disha6/questions");
const Disha6Scoring = require("../config/psychometric/disha6/scoring");
const Disha6Assessment = require("../models/psychometric/disha6Assessment.model");
const Disha7Bank = require("../config/psychometric/disha7/questions");
const Disha7Scoring = require("../config/psychometric/disha7/scoring");
const Disha7Assessment = require("../models/psychometric/disha7Assessment.model");
const Disha8Bank = require("../config/psychometric/disha8/questions");
const Disha8Scoring = require("../config/psychometric/disha8/scoring");
const Disha8Assessment = require("../models/psychometric/disha8Assessment.model");

class PsychometricService {
    
    static async getAcademicQuestions() {
        try {

        const questions = await AcademicQuestion.find({})
            .select("_id questionText dimension isPositive")
            .lean();

        if (!questions.length) {
            throw {
            status: 404,
            message: "No questions found"
            };
        }

        return {
            status: true,
            message: "Questions fetched successfully",
            data: questions
        };

        } catch (error) {
        return {
            status: false,
            error: {
            status: error.status || 500,
            message: error.message || "Failed to fetch questions"
            }
        };
        }
    }

    static async submitAssessment(req) {
        try {
            const { answers, completionTimeSeconds } = req.body;
            console.log("req.authData.user",req.authData.user)
            const studentId = req.authData.user._id;

            if (!Array.isArray(answers) || answers.length !== 40) {
            throw {
                status: 400,
                message: "All 40 questions must be answered"
            };
            }

            /* =========================
            FETCH ALL QUESTIONS
            ========================= */
            const questions = await AcademicQuestion.find().lean();

            if (questions.length !== 40) {
            throw {
                status: 500,
                message: "Questions not properly configured"
            };
            }

            /* =========================
            PROCESS ANSWERS
            ========================= */
            let totalScore = 0;
            const processedAnswers = [];

            for (const question of questions) {

            const studentAnswer = answers.find(
                a => String(a.questionId) === String(question._id)
            );

            if (!studentAnswer || !studentAnswer.selectedOption) {
                throw {
                status: 400,
                message: `AcademicQuestion ${question._id} not answered`
                };
            }

            const calculatedScore = calculateScore(
                Number(studentAnswer.selectedOption),
                question.isPositive
            );

            totalScore += calculatedScore;

            processedAnswers.push({
                questionId: question._id,
                selectedOption: studentAnswer.selectedOption,
                calculatedScore
            });
            }

            const percentage = (totalScore / 200) * 100;
            const level = getOverallLevel(totalScore);

            /* =========================
            CALCULATE DIMENSIONS
            ========================= */
            const dimensionResults = [];

            for (const dimensionName in dimensionConfig) {

            const { items, maxScore } = dimensionConfig[dimensionName];

            const dimensionScore = processedAnswers
                .filter(ans => items.includes(ans.questionId))
                .reduce((sum, ans) => sum + ans.calculatedScore, 0);

            const dimPercentage = (dimensionScore / maxScore) * 100;
            const dimLevel = getDimensionLevel(dimPercentage);

            dimensionResults.push({
                name: dimensionName,
                score: dimensionScore,
                maxScore,
                percentage: dimPercentage,
                level: dimLevel
            });
            }

            /* =========================
            STORE SUBMISSION
            ========================= */
            // const submission = await AcademicAssessment.create({
            // studentId,
            // responses: processedAnswers,
            // totalScore,
            // percentage,
            // level,
            // dimensions: dimensionResults,
            // completionTimeSeconds: completionTimeSeconds || null,
            // submittedAt: new Date()
            // });

            /* =========================
            STORE OR UPDATE SUBMISSION
            ========================= */

            // Check if student already has submission
            const existingSubmission = await AcademicAssessment.findOne({ studentId });

            let submission;

            if (existingSubmission) {

            submission = await AcademicAssessment.findByIdAndUpdate(
                existingSubmission._id,
                {
                responses: processedAnswers,
                totalScore,
                percentage,
                level,
                dimensions: dimensionResults,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
                $inc: { attemptNumber: 1 }  
                },
                { new: true }
            );

            } else {

            submission = await AcademicAssessment.create({
                studentId,
                responses: processedAnswers,
                totalScore,
                percentage,
                level,
                dimensions: dimensionResults,
                completionTimeSeconds: completionTimeSeconds || null,
                attemptNumber: 1,
                submittedAt: new Date()
            });

            }

            /* =========================
            RESPONSE STRUCTURE
            ========================= */
            return {
            status: true,
            message: "Assessment submitted successfully",
            data: {
                submissionId: submission._id,
                totalScore,
                percentage,
                level,
                dimensions: dimensionResults
            }
            };

        } catch (error) {
            return {
            status: false,
            error: {
                status: error.status || 500,
                message: error.message || "Assessment submission failed"
            }
            };
        }
    }

    static async getAcademicResult(req) {
        try {
            const studentId = req.authData.user._id;

            const result = await AcademicAssessment
            .findOne({ studentId })
            .sort({ submittedAt: -1 })
            .lean();

            if (!result) {
            return {
                status: true,
                data: null
            };
            }

            return {
            status: true,
            data: result
            };

        } catch (error) {
            return {
            status: false,
            error: {
                status: 500,
                message: "Failed to fetch result"
            }
            };
        }
    }

    static async submitMBTIAssessment(req) {
        try {
            const { answers, completionTimeSeconds } = req.body;
            const studentId = req.authData.user._id;

            if (!Array.isArray(answers) || answers.length !== 70) {
                throw {
                    status: 400,
                    message: "All 70 questions must be answered"
                };
            }

            /* ==============================
            INITIALIZE COLUMN BUCKETS
            ============================== */

            const columns = {
                1: { A: 0, B: 0 },
                2: { A: 0, B: 0 },
                3: { A: 0, B: 0 },
                4: { A: 0, B: 0 }
            };

            /* ==============================
            COLUMN MAPPING FUNCTION
            ============================== */

            const getColumn = (id) => {
                if ([1,8,15,22,29,36,43,50,57,64].includes(id)) return 1;
                if ([2,9,16,23,30,37,44,51,58,65].includes(id)) return 2;
                if ([3,10,17,24,31,38,45,52,59,66].includes(id)) return 3;
                if ([4,11,18,25,32,39,46,53,60,67].includes(id)) return 4;
                if ([5,12,19,26,33,40,47,54,61,68].includes(id)) return 3; // merged to Column 3
                if ([6,13,20,27,34,41,48,55,62,69].includes(id)) return 4; // merged to Column 4
                if ([7,14,21,28,35,42,49,56,63,70].includes(id)) return 4; // merged to Column 4
            };

            /* ==============================
            PROCESS RESPONSES
            ============================== */

            const processedAnswers = [];

            for (const ans of answers) {

                const { question_id, response } = ans;

                if (!["A", "B"].includes(response)) {
                    throw {
                        status: 400,
                        message: `Invalid response for question ${question_id}`
                    };
                }

                const column = getColumn(Number(question_id));

                columns[column][response] += 1;

                processedAnswers.push({
                    questionId: question_id,
                    response,
                    column
                });
            }

            /* ==============================
            MERGE LOGIC
            ============================== */

            const E = columns[1].A;
            const I = columns[1].B;

            const S = columns[2].A;
            const N = columns[2].B;

            const T = columns[3].A;
            const F = columns[3].B;

            const J = columns[4].A;
            const P = columns[4].B;

            /* ==============================
            CALCULATE PERCENTAGES
            ============================== */

            const calculatePercentage = (a, b) => {
                const total = a + b;
                return total === 0 ? 50 : Math.round((Math.max(a, b) / total) * 100);
            };

            const EI_percent = calculatePercentage(E, I);
            const SN_percent = calculatePercentage(S, N);
            const TF_percent = calculatePercentage(T, F);
            const JP_percent = calculatePercentage(J, P);

            const getConfidence = (percent) => {
                if (percent >= 60) return "Strong";
                if (percent >= 50) return "Moderate";
                return "Balanced";
            };

            /* ==============================
            DETERMINE FINAL TYPE
            ============================== */

            const mbti_type =
                (E >= I ? "E" : "I") +
                (S >= N ? "S" : "N") +
                (T >= F ? "T" : "F") +
                (J >= P ? "J" : "P");

            /* ==============================
            STORE OR UPDATE
            ============================== */

            const existing = await MBTIAssessment.findOne({ studentId });

            let submission;

            if (existing) {
                submission = await MBTIAssessment.findByIdAndUpdate(
                    existing._id,
                    {
                        responses: processedAnswers,
                        scores: { E, I, S, N, T, F, J, P },
                        percentages: {
                            EI: EI_percent,
                            SN: SN_percent,
                            TF: TF_percent,
                            JP: JP_percent
                        },
                        mbti_type,
                        completionTimeSeconds: completionTimeSeconds || null,
                        submittedAt: new Date(),
                        $inc: { attemptNumber: 1 }
                    },
                    { new: true }
                );
            } else {
                submission = await MBTIAssessment.create({
                    studentId,
                    responses: processedAnswers,
                    scores: { E, I, S, N, T, F, J, P },
                    percentages: {
                        EI: EI_percent,
                        SN: SN_percent,
                        TF: TF_percent,
                        JP: JP_percent
                    },
                    mbti_type,
                    attemptNumber: 1,
                    completionTimeSeconds: completionTimeSeconds || null,
                    submittedAt: new Date()
                });
            }

            /* ==============================
            RESPONSE STRUCTURE
            ============================== */

            return {
                status: true,
                message: "MBTI Assessment submitted successfully",
                data: {
                    submissionId: submission._id,
                    mbti_type,
                    scores: { E, I, S, N, T, F, J, P },
                    percentages: {
                        EI: EI_percent,
                        SN: SN_percent,
                        TF: TF_percent,
                        JP: JP_percent
                    },
                    confidence: {
                        EI: getConfidence(EI_percent),
                        SN: getConfidence(SN_percent),
                        TF: getConfidence(TF_percent),
                        JP: getConfidence(JP_percent)
                    }
                }
            };

        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "MBTI submission failed"
                }
            };
        }
    }

    static async getMBTIResult(req) {
        try {
            const studentId = req.authData.user._id;

            const result = await MBTIAssessment
            .findOne({ studentId })
            .sort({ submittedAt: -1 })
            .lean();

            if (!result) {
            return {
                status: true,
                data: null
            };
            }

            return {
            status: true,
            data: result
            };

        } catch (error) {
            return {
            status: false,
            error: {
                status: 500,
                message: "Failed to fetch result"
            }
            };
        }
    }

    static async getCareerQuestions() {
        try {

            const questions = await CareerQuestion.find({})
                .select("id text dimension scoreIf")
                .lean();

            if (!questions.length) {
                throw {
                    status: 404,
                    message: "No career questions found"
                };
            }

            return {
                status: true,
                message: "Career questions fetched successfully",
                data: questions
            };

        } catch (error) {

            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "Failed to fetch career questions"
                }
            };

        }
    }

    static async submitCareerAssessment(req) {

        try {

            const { answers, completionTimeSeconds } = req.body;
            const studentId = req.authData.user._id;

            /* =========================
            VALIDATE ANSWERS
            ========================= */

            if (!Array.isArray(answers) || answers.length !== 24) {
                throw {
                    status: 400,
                    message: "All 24 questions must be answered"
                };
            }

            /* =========================
            FETCH QUESTIONS
            ========================= */

            const questions = await CareerQuestion.find().lean();

            if (questions.length !== 24) {
                throw {
                    status: 500,
                    message: "Career questions not configured properly"
                };
            }

            /* =========================
            SCORING KEY
            ========================= */

            const scoringKey = {
                careerConcern: {
                    items: [1, 5, 9, 13, 17, 21],
                    correctAnswer: "D"
                },
                careerCuriosity: {
                    items: [2, 6, 10, 14, 18, 22],
                    correctAnswer: "D"
                },
                careerConfidence: {
                    items: [3, 7, 11, 15, 19, 23],
                    correctAnswer: "D"
                },
                careerConsultation: {
                    items: [
                        { id: 4, answer: "A" },
                        { id: 8, answer: "A" },
                        { id: 12, answer: "A" },
                        { id: 16, answer: "D" },
                        { id: 20, answer: "A" },
                        { id: 24, answer: "A" }
                    ]
                }
            };

            /* =========================
            PROCESS ANSWERS
            ========================= */

            let totalScore = 0;
            const processedAnswers = [];

            for (const question of questions) {

                const studentAnswer = answers.find(
                    a => Number(a.questionId) === question.id
                );

                if (!studentAnswer) {
                    throw {
                        status: 400,
                        message: `Question ${question.id} not answered`
                    };
                }

                let calculatedScore = 0;

                /* CHECK DIMENSION SCORING */

                for (const dimension in scoringKey) {

                    const config = scoringKey[dimension];

                    if (dimension !== "careerConsultation") {

                        if (
                            config.items.includes(question.id) &&
                            studentAnswer.selectedOption === config.correctAnswer
                        ) {
                            calculatedScore = 1;
                        }

                    } else {

                        const consultationItem = config.items.find(
                            item => item.id === question.id
                        );

                        if (
                            consultationItem &&
                            consultationItem.answer === studentAnswer.selectedOption
                        ) {
                            calculatedScore = 1;
                        }

                    }

                }

                totalScore += calculatedScore;

                processedAnswers.push({
                    questionId: question.id,
                    selectedOption: studentAnswer.selectedOption,
                    calculatedScore
                });

            }

            /* =========================
            CALCULATE DIMENSIONS
            ========================= */

            const dimensionResults = [];

            for (const dimension in scoringKey) {

                let dimensionScore = 0;

                if (dimension !== "careerConsultation") {

                    const items = scoringKey[dimension].items;

                    dimensionScore = processedAnswers
                        .filter(ans => items.includes(ans.questionId))
                        .reduce((sum, ans) => sum + ans.calculatedScore, 0);

                } else {

                    const items = scoringKey[dimension].items.map(i => i.id);

                    dimensionScore = processedAnswers
                        .filter(ans => items.includes(ans.questionId))
                        .reduce((sum, ans) => sum + ans.calculatedScore, 0);

                }

                const maxScore = 6;
                const percentage = (dimensionScore / maxScore) * 100;

                let level = "Low";

                if (dimensionScore >= 5) level = "High";
                else if (dimensionScore >= 3) level = "Moderate";

                dimensionResults.push({
                    name: dimension,
                    score: dimensionScore,
                    maxScore,
                    percentage,
                    level
                });

            }

            /* =========================
            OVERALL SCORE
            ========================= */

            const maxTotalScore = 24;
            const percentage = (totalScore / maxTotalScore) * 100;

            let overallLevel = "Low";

            if (percentage >= 75) overallLevel = "High";
            else if (percentage >= 50) overallLevel = "Moderate";

            /* =========================
            STORE SUBMISSION
            ========================= */

            const existingSubmission = await CareerAssessment.findOne({ studentId });

            let submission;

            if (existingSubmission) {

                submission = await CareerAssessment.findByIdAndUpdate(
                    existingSubmission._id,
                    {
                        responses: processedAnswers,
                        totalScore,
                        percentage,
                        level: overallLevel,
                        dimensions: dimensionResults,
                        completionTimeSeconds: completionTimeSeconds || null,
                        submittedAt: new Date(),
                        $inc: { attemptNumber: 1 }
                    },
                    { new: true }
                );

            } else {

                submission = await CareerAssessment.create({
                    studentId,
                    responses: processedAnswers,
                    totalScore,
                    percentage,
                    level: overallLevel,
                    dimensions: dimensionResults,
                    completionTimeSeconds: completionTimeSeconds || null,
                    attemptNumber: 1,
                    submittedAt: new Date()
                });

            }

            /* =========================
            RESPONSE
            ========================= */

            return {
                status: true,
                message: "Career assessment submitted successfully",
                data: submission
            };

        } catch (error) {

            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "Career assessment submission failed"
                }
            };

        }

    }

    static async getCareerResult(req) {
        try {

            const studentId = req.authData.user._id;

            const result = await CareerAssessment
                .findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!result) {
                return {
                    status: true,
                    data: null
                };
            }

            return {
                status: true,
                data: result
            };

        } catch (error) {

            return {
                status: false,
                error: {
                    status: 500,
                    message: "Failed to fetch career assessment result"
                }
            };

        }
    }

    static async getRiasecQuestions() {
        try {

            const questions = await RiasecQuestion.find({})
                .select("id text dimension scoreIf")
                .lean();

            if (!questions.length) {
                throw {
                    status: 404,
                    message: "No career questions found"
                };
            }

            return {
                status: true,
                message: "Career questions fetched successfully",
                data: questions
            };

        } catch (error) {

            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "Failed to fetch career questions"
                }
            };

        }
    }

    static async submitRiasecAssessment(req) {

        try {

            const { answers, completionTimeSeconds } = req.body;
            const studentId = req.authData.user._id;

            /* =========================
            VALIDATE ANSWERS
            ========================= */

            if (!Array.isArray(answers) || answers.length !== 42) {
                throw {
                    status: 400,
                    message: "All 42 questions must be answered"
                };
            }

            /* =========================
            FETCH QUESTIONS
            ========================= */

            const questions = await RiasecQuestion.find().lean();

            if (questions.length !== 42) {
                throw {
                    status: 500,
                    message: "RIASEC questions not configured properly"
                };
            }

            /* =========================
            INITIALIZE DIMENSIONS
            ========================= */

            const dimensionScores = {
                R: 0,
                I: 0,
                A: 0,
                S: 0,
                E: 0,
                C: 0
            };

            let totalScore = 0;
            const processedAnswers = [];

            /* =========================
            PROCESS ANSWERS
            ========================= */

            for (const question of questions) {

                const studentAnswer = answers.find(
                    a => Number(a.questionId) === question.id
                );

                if (!studentAnswer || !studentAnswer.selectedOption) {
                    throw {
                        status: 400,
                        message: `Question ${question.id} not answered`
                    };
                }

                let calculatedScore = 0;

                if (studentAnswer.selectedOption === "A") {
                    calculatedScore = 1;
                    dimensionScores[question.dimension] += 1;
                }

                totalScore += calculatedScore;

                processedAnswers.push({
                    questionId: question.id,
                    selectedOption: studentAnswer.selectedOption,
                    calculatedScore
                });

            }

            /* =========================
            GENERATE RIASEC CODE
            ========================= */

            const sortedDimensions = Object.entries(dimensionScores)
                .sort((a, b) => b[1] - a[1]);

            const interestCode = sortedDimensions
                .slice(0, 3)
                .map(d => d[0])
                .join("");

            /* =========================
            STORE OR UPDATE SUBMISSION
            ========================= */

            const existingSubmission = await RiasecAssessment.findOne({ studentId });

            let submission;

            if (existingSubmission) {

                submission = await RiasecAssessment.findByIdAndUpdate(
                    existingSubmission._id,
                    {
                        responses: processedAnswers,
                        dimensionScores,
                        interestCode,
                        totalScore,
                        completionTimeSeconds: completionTimeSeconds || null,
                        submittedAt: new Date(),
                        $inc: { attemptNumber: 1 }
                    },
                    { new: true }
                );

            } else {

                submission = await RiasecAssessment.create({
                    studentId,
                    responses: processedAnswers,
                    dimensionScores,
                    interestCode,
                    totalScore,
                    completionTimeSeconds: completionTimeSeconds || null,
                    attemptNumber: 1,
                    submittedAt: new Date()
                });

            }

            /* =========================
            RESPONSE
            ========================= */

            return {
                status: true,
                message: "RIASEC assessment submitted successfully",
                data: {
                    submissionId: submission._id,
                    totalScore,
                    dimensionScores,
                    interestCode
                }
            };

        } catch (error) {

            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "RIASEC assessment submission failed"
                }
            };

        }

    }

    static async getRiasecResult(req) {
        try {

            const studentId = req.authData.user._id;

            const result = await RiasecAssessment
                .findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!result) {
                return {
                    status: true,
                    data: null
                };
            }

            return {
                status: true,
                data: result
            };

        } catch (error) {

            return {
                status: false,
                error: {
                    status: 500,
                    message: "Failed to fetch career assessment result"
                }
            };

        }
    }

    /* =====================================================================
       DISHA — Differential Intelligence & Scholastic Horizon Assessment
       Flagship multi-module test. Questions are served from the code-based
       item bank (answer keys / scoring metadata stripped). Scoring runs
       server-side via the DISHA scoring engine.
       ===================================================================== */

    static async getDishaQuestions() {
        try {
            // Strip answer keys and scoring-only metadata before sending to client.
            const stripMcq = (item) => ({
                id: item.id,
                dim: item.dim,
                subType: item.subType,
                imageUrl: item?.imageUrl,
                imageDescription: item?.imageDescription,
                text: item.text,
                options: item.options,
                format: item.format,
                maxCount: item.maxCount,
                answer: item?.answer
            });

            const stripLikert = (item) => ({
                id: item.id,
                type: item.type || "likert",
                text: item.text,
                factor: item.factor ? "personality" : undefined, // hide which factor an item scores
                dim: item.scale ? undefined : item.dim, // RIASEC dim hidden too
                scale: item.scale ? "value" : undefined,
                indiaSpecific: item.indiaSpecific || false,
            });

            const data = {
                modules: DishaBank.MODULES,
                academic: {
                    subjects: DishaBank.ACADEMIC_SUBJECTS,
                    terms: DishaBank.ACADEMIC_TERMS,
                    supplementary: DishaBank.ACADEMIC_SUPPLEMENTARY,
                },
                aptitude: {
                    verbal: DishaBank.VERBAL.map(stripMcq),
                    numerical: DishaBank.NUMERICAL.map(stripMcq),
                    spatial: DishaBank.SPATIAL.map(stripMcq),
                    abstract: DishaBank.ABSTRACT.map(stripMcq),
                    closure: DishaBank.CLOSURE_CLERICAL_MECH.map(stripMcq),
                    memory: DishaBank.MEMORY_CREATIVITY.map(stripMcq),
                },
                // Personality items keep order but hide factor/reverse keying.
                personality: DishaBank.OCEAN.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                riasec: {
                    forcedChoice: DishaBank.RIASEC_FC.map((p) => ({
                        id: p.id,
                        optionA: { text: p.optionA.text },
                        optionB: { text: p.optionB.text },
                    })),
                    likert: DishaBank.RIASEC_LIKERT.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                },
                workValues: DishaBank.WORK_VALUES.map((i) =>
                    i.type === "forced_choice"
                        ? { id: i.id, type: "forced_choice", text: i.text, optionA: { text: i.optionA.text }, optionB: { text: i.optionB.text }, indiaSpecific: i.indiaSpecific || false }
                        : { id: i.id, type: "likert", text: i.text, indiaSpecific: i.indiaSpecific || false }
                ),
                ics: DishaBank.ICS.map((i) => ({
                    id: i.id,
                    text: i.text,
                    control: i.control || "likert",
                    options: i.options,
                    min: i.min,
                    max: i.max,
                    counsellorOnly: i.counsellorOnly || false,
                    followUp: i.followUp || null,
                })),
                sjt: DishaBank.SJT.map((s) => ({
                    id: s.id,
                    title: s.title,
                    competencies: s.competencies,
                    classFocus: s.classFocus,
                    scenario: s.scenario,
                    options: s.options.map((o) => ({ key: o.key, text: o.text })),
                })),
            };

            return {
                status: true,
                message: "DISHA questions fetched successfully",
                data,
            };
        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "Failed to fetch DISHA questions",
                },
            };
        }
    }

    static async submitDishaAssessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                aptitude = {},
                personality = {},
                riasecForcedChoice = {},
                riasecLikert = {},
                workValuesLikert = {},
                workValuesForcedChoice = {},
                ics = {},
                sjt = {},
                academicMarks = [],
                supplementary = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const aptitudeResult = DishaScoring.scoreAptitude(aptitude);
            const personalityResult = DishaScoring.scorePersonality(personality);
            const riasecResult = DishaScoring.scoreRiasec(riasecForcedChoice, riasecLikert);
            const workValuesResult = DishaScoring.scoreWorkValues(workValuesLikert, workValuesForcedChoice);
            const sjtResult = DishaScoring.scoreSjt(sjt);
            const validityResult = DishaScoring.scoreValidity(personality);
            const academicResult = DishaScoring.scoreAcademic(academicMarks);
            const ccre = DishaScoring.computeCcre({
                aptitude: aptitudeResult,
                academic: academicResult,
                personality: personalityResult,
                riasec: riasecResult,
                workValues: workValuesResult,
            });

            const result = {
                aptitude: aptitudeResult,
                personality: personalityResult,
                riasec: riasecResult,
                workValues: workValuesResult,
                sjt: sjtResult,
                academic: academicResult,
                validity: validityResult,
                ccre,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    aptitude,
                    personality,
                    riasecForcedChoice,
                    riasecLikert,
                    workValuesLikert,
                    workValuesForcedChoice,
                    ics,
                    sjt,
                    academicMarks,
                    supplementary,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await DishaAssessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await DishaAssessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await DishaAssessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA assessment submitted successfully",
                data: {
                    submissionId: submission._id,
                    profile,
                    result,
                },
            };
        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "DISHA assessment submission failed",
                },
            };
        }
    }

    static async getDishaResult(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await DishaAssessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 2 of 8: Interests, Work Values, Career Motivations &
       Occupational Preferences. Questions are served from the code-based item
       bank (scoring weights / SJT moPoints stripped). Scoring runs server-side
       via the Test-2 scoring engine.
       ===================================================================== */

    static async getDisha2Questions() {
        try {
            const data = {
                modules: Disha2Bank.MODULES,
                // Module A — activity preferences (hide RIASEC type from client).
                activities: Disha2Bank.ACTIVITY_PREFS.map((i) => ({
                    id: i.id,
                    text: i.text,
                    indiaSpecific: i.indiaSpecific || false,
                })),
                // Module B — occupational ratings (Holland code kept hidden).
                occupations: Disha2Bank.OCCUPATIONS.map((o) => ({
                    id: o.id,
                    title: o.title,
                    sector: o.sector,
                    description: o.description,
                })),
                // Module C — work values: likert + FC pairs + ranking pool.
                workValues: {
                    likert: Disha2Bank.WORK_VALUES_LIKERT.map((i) => ({
                        id: i.id,
                        text: i.text,
                        indiaSpecific: i.indiaSpecific || false,
                    })),
                    forcedChoice: Disha2Bank.WORK_VALUES_FC.map((p) => ({
                        id: p.id,
                        optionA: { text: p.optionA.text },
                        optionB: { text: p.optionB.text },
                    })),
                    rankOptions: Disha2Bank.VALUE_RANK_OPTIONS.map((v) => ({
                        value: v.value,
                        label: v.label,
                        description: v.description,
                        indiaSpecific: v.indiaSpecific || false,
                    })),
                },
                // Module D — career motivations (scale hidden).
                motivations: Disha2Bank.MOTIVATIONS.map((i) => ({
                    id: i.id,
                    text: i.text,
                    indiaSpecific: i.indiaSpecific || false,
                })),
                // Module E — work environment: sector FC pairs + bipolar work-style.
                environment: {
                    sector: Disha2Bank.ENV_SECTOR_FC.map((p) => ({
                        id: p.id,
                        optionA: { text: p.optionA.text },
                        optionB: { text: p.optionB.text },
                    })),
                    workStyle: Disha2Bank.WORK_STYLE.map((i) => ({
                        id: i.id,
                        left: i.left,
                        right: i.right,
                    })),
                },
                // Module F — SJT (moPoints / notes stripped).
                sjt: Disha2Bank.SJT_T2.map((s) => ({
                    id: s.id,
                    title: s.title,
                    competencies: s.competencies,
                    classFocus: s.classFocus,
                    scenario: s.scenario,
                    options: s.options.map((o) => ({ key: o.key, text: o.text })),
                })),
            };

            return {
                status: true,
                message: "DISHA Test 2 questions fetched successfully",
                data,
            };
        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "Failed to fetch DISHA Test 2 questions",
                },
            };
        }
    }

    static async submitDisha2Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                activities = {},
                occupations = {},
                workValuesLikert = {},
                workValuesForcedChoice = {},
                valueRanking = [],
                motivations = {},
                envSector = {},
                workStyle = {},
                sjt = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const riasecResult = Disha2Scoring.scoreRiasec(activities, occupations);
            const workValuesResult = Disha2Scoring.scoreWorkValues(
                workValuesLikert,
                workValuesForcedChoice,
                valueRanking
            );
            const motivationsResult = Disha2Scoring.scoreMotivations(motivations);
            const environmentResult = Disha2Scoring.scoreEnvironment(envSector, workStyle);
            const sjtResult = Disha2Scoring.scoreSjt(sjt);
            const summary = Disha2Scoring.computeT2Summary({
                riasec: riasecResult,
                workValues: workValuesResult,
                motivations: motivationsResult,
            });

            const result = {
                riasec: riasecResult,
                workValues: workValuesResult,
                motivations: motivationsResult,
                environment: environmentResult,
                sjt: sjtResult,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    activities,
                    occupations,
                    workValuesLikert,
                    workValuesForcedChoice,
                    valueRanking,
                    motivations,
                    envSector,
                    workStyle,
                    sjt,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha2Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha2Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha2Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 2 assessment submitted successfully",
                data: {
                    submissionId: submission._id,
                    profile,
                    result,
                },
            };
        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "DISHA Test 2 assessment submission failed",
                },
            };
        }
    }

    static async getDisha2Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha2Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 2 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 3 of 8: Academic Performance Analysis, Subject Strengths,
       Learning Styles & Study Habits. Questions/config served from the
       code-based bank (SJT moPoints / scale keys stripped). Scoring runs
       server-side via the Test-3 scoring engine.
       ===================================================================== */

    static async getDisha3Questions() {
        try {
            const data = {
                sections: Disha3Bank.SECTIONS,
                // Section 1 — marks module config.
                marks: {
                    intake: Disha3Bank.MARKS_INTAKE,
                    termSets: Disha3Bank.TERM_SETS,
                    subjectSets: Disha3Bank.SUBJECT_SETS,
                    subjectSetRules: Disha3Bank.SUBJECT_SET_RULES,
                    supplementary: Disha3Bank.MARKS_SUPPLEMENTARY,
                },
                // Section 2 — proficiency scale anchors + subject identity questions.
                proficiency: {
                    scale: Disha3Bank.PROFICIENCY_SCALE,
                    identity: Disha3Bank.SUBJECT_IDENTITY,
                },
                // Section 3 — learning styles (scale hidden from client).
                learningStyles: {
                    likert: Disha3Bank.LEARNING_STYLES.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                    forcedChoice: Disha3Bank.LEARNING_STYLE_FC.map((p) => ({
                        id: p.id,
                        prompt: p.prompt,
                        optionA: { text: p.optionA.text },
                        optionB: { text: p.optionB.text },
                    })),
                },
                // Section 4 — study habits (scale / reverse hidden).
                studyHabits: Disha3Bank.STUDY_HABITS.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                // Section 5 — exam prep (scale hidden).
                examPrep: Disha3Bank.EXAM_PREP.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                // Section 6 — SJT (moPoints / notes stripped).
                sjt: Disha3Bank.SJT_T3.map((s) => ({
                    id: s.id,
                    title: s.title,
                    competencies: s.competencies,
                    context: s.context,
                    scenario: s.scenario,
                    options: s.options.map((o) => ({ key: o.key, text: o.text })),
                })),
                // Validity (presented as plain agree/disagree items).
                validity: Disha3Bank.VALIDITY.map((i) => ({ id: i.id, text: i.text })),
            };

            return {
                status: true,
                message: "DISHA Test 3 questions fetched successfully",
                data,
            };
        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "Failed to fetch DISHA Test 3 questions",
                },
            };
        }
    }

    static async submitDisha3Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                marks = {},
                previousMarks = {},
                marksSupplementary = {},
                proficiency = {},
                subjectIdentity = {},
                learningStyles = {},
                learningStyleFc = {},
                studyHabits = {},
                examPrep = {},
                sjt = {},
                validity = {},
                streamSubjects = null,
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const marksResult = Disha3Scoring.scoreMarks(marks, streamSubjects);
            const proficiencyResult = Disha3Scoring.scoreProficiency(proficiency, marksResult);
            const learningStylesResult = Disha3Scoring.scoreLearningStyles(learningStyles, learningStyleFc);
            const studyHabitsResult = Disha3Scoring.scoreStudyHabits(studyHabits);
            const examPrepResult = Disha3Scoring.scoreExamPrep(examPrep);
            const sjtResult = Disha3Scoring.scoreSjt(sjt);
            const streamsResult = Disha3Scoring.streamProbabilities(marksResult, studyHabitsResult);
            const examProbResult = Disha3Scoring.examProbabilities(marksResult, studyHabitsResult, examPrepResult);
            const validityResult = Disha3Scoring.scoreValidity(validity);
            const summary = Disha3Scoring.computeSummary({
                marks: marksResult,
                studyHabits: studyHabitsResult,
                examPrep: examPrepResult,
            });

            const result = {
                marks: marksResult,
                proficiency: proficiencyResult,
                learningStyles: learningStylesResult,
                studyHabits: studyHabitsResult,
                examPrep: examPrepResult,
                sjt: sjtResult,
                streams: streamsResult,
                examProbabilities: examProbResult,
                validity: validityResult,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    marks,
                    previousMarks,
                    marksSupplementary,
                    proficiency,
                    subjectIdentity,
                    learningStyles,
                    learningStyleFc,
                    studyHabits,
                    examPrep,
                    sjt,
                    validity,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha3Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha3Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha3Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 3 assessment submitted successfully",
                data: {
                    submissionId: submission._id,
                    profile,
                    result,
                },
            };
        } catch (error) {
            return {
                status: false,
                error: {
                    status: error.status || 500,
                    message: error.message || "DISHA Test 3 assessment submission failed",
                },
            };
        }
    }

    static async getDisha3Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha3Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 3 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 4 of 8: Emotional Intelligence, Resilience, Stress
       Management & Interpersonal Fit. Questions served from the code-based
       bank (scale keys / reverse flags / SJT moPoints stripped). Scoring runs
       server-side via the Test-4 scoring engine.
       ===================================================================== */

    static async getDisha4Questions() {
        try {
            const stripLikert = (i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false });
            const data = {
                sections: Disha4Bank.SECTIONS,
                selfAwareness: Disha4Bank.SELF_AWARENESS.map(stripLikert),
                selfRegulation: Disha4Bank.SELF_REGULATION.map(stripLikert),
                resilience: Disha4Bank.RESILIENCE.map(stripLikert),
                empathy: Disha4Bank.EMPATHY.map(stripLikert),
                adaptability: Disha4Bank.ADAPTABILITY.map(stripLikert),
                sjt: {
                    blockF: Disha4Bank.SJT_F.map((s) => ({
                        id: s.id, title: s.title, competencies: s.competencies, context: s.context, scenario: s.scenario,
                        options: s.options.map((o) => ({ key: o.key, text: o.text })),
                    })),
                    blockG: Disha4Bank.SJT_G.map((s) => ({
                        id: s.id, title: s.title, competencies: s.competencies, context: s.context, scenario: s.scenario,
                        options: s.options.map((o) => ({ key: o.key, text: o.text })),
                    })),
                },
                validity: Disha4Bank.VALIDITY.map((i) => ({ id: i.id, text: i.text })),
                crisisSelfCheck: { id: Disha4Bank.CRISIS_SELF_CHECK.id, text: Disha4Bank.CRISIS_SELF_CHECK.text },
            };
            return { status: true, message: "DISHA Test 4 questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Test 4 questions" },
            };
        }
    }

    static async submitDisha4Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                selfAwareness = {},
                selfRegulation = {},
                resilience = {},
                empathy = {},
                adaptability = {},
                sjt = {},
                validity = {},
                crisisSelfCheck = null,
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const selfAwarenessResult = Disha4Scoring.scoreSelfAwareness(selfAwareness);
            const selfRegulationResult = Disha4Scoring.scoreSelfRegulation(selfRegulation);
            const resilienceResult = Disha4Scoring.scoreResilience(resilience);
            const empathyResult = Disha4Scoring.scoreEmpathy(empathy);
            const adaptabilityResult = Disha4Scoring.scoreAdaptability(adaptability);
            const sjtResult = Disha4Scoring.scoreSjt(sjt);

            // RII inconsistency uses the union of all Likert section responses.
            const allResponses = { ...selfAwareness, ...selfRegulation, ...resilience, ...empathy, ...adaptability };
            const validityResult = Disha4Scoring.scoreValidity(validity, allResponses);

            const overall = Disha4Scoring.computeOverallEq({
                selfAwareness: selfAwarenessResult,
                selfRegulation: selfRegulationResult,
                resilience: resilienceResult,
                empathy: empathyResult,
                adaptability: adaptabilityResult,
                sjt: sjtResult,
            });

            const { flags, summary } = Disha4Scoring.computeFlagsAndSummary({
                selfRegulation: selfRegulationResult,
                resilience: resilienceResult,
                empathy: empathyResult,
                sjt: sjtResult,
                validity: validityResult,
                overall,
                crisisSelfCheck,
            });

            const result = {
                selfAwareness: selfAwarenessResult,
                selfRegulation: selfRegulationResult,
                resilience: resilienceResult,
                empathy: empathyResult,
                adaptability: adaptabilityResult,
                sjt: sjtResult,
                validity: validityResult,
                overall,
                flags,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    selfAwareness, selfRegulation, resilience, empathy, adaptability, sjt, validity, crisisSelfCheck,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha4Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha4Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha4Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 4 assessment submitted successfully",
                data: { submissionId: submission._id, profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Test 4 assessment submission failed" },
            };
        }
    }

    static async getDisha4Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha4Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 4 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 5 of 8: Career Adaptability, Decision-Making Style, Growth
       Mindset, Learning Agility & Future-Readiness. Questions served from the
       code-based bank (scale keys / reverse flags / SJT moPoints stripped).
       Scoring runs server-side via the Test-5 scoring engine.
       ===================================================================== */

    static async getDisha5Questions() {
        try {
            const stripLikert = (i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false });
            const stripSjt = (s) => ({
                id: s.id, title: s.title, competencies: s.competencies, context: s.context, scenario: s.scenario,
                options: s.options.map((o) => ({ key: o.key, text: o.text })),
            });
            const data = {
                sections: Disha5Bank.SECTIONS,
                adaptability: Disha5Bank.ADAPTABILITY_4C.map(stripLikert),
                mindset: Disha5Bank.MINDSET.map(stripLikert),
                decisionStyle: Disha5Bank.DECISION_STYLE.map(stripLikert),
                learningAgility: Disha5Bank.LEARNING_AGILITY.map(stripLikert),
                ambiguityRisk: Disha5Bank.AMBIGUITY_RISK.map(stripLikert),
                futureOrientation: Disha5Bank.FUTURE_ORIENTATION.map(stripLikert),
                sjt: {
                    blockG: Disha5Bank.SJT_G.map(stripSjt),
                    blockH: Disha5Bank.SJT_H.map(stripSjt),
                },
                validity: Disha5Bank.VALIDITY.map((i) => ({ id: i.id, text: i.text })),
                // scale labels for the Section A "Not strong at all → Very strong" anchors
                adaptabilityScale: ["Not strong at all", "Slightly strong", "Moderately strong", "Strong", "Very strong"],
            };
            return { status: true, message: "DISHA Test 5 questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Test 5 questions" },
            };
        }
    }

    static async submitDisha5Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                adaptability = {},
                mindset = {},
                decisionStyle = {},
                learningAgility = {},
                ambiguityRisk = {},
                futureOrientation = {},
                sjt = {},
                validity = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const adaptabilityResult = Disha5Scoring.scoreAdaptability(adaptability);
            const mindsetResult = Disha5Scoring.scoreMindset(mindset);
            const decisionStyleResult = Disha5Scoring.scoreDecisionStyle(decisionStyle, adaptabilityResult);
            const learningAgilityResult = Disha5Scoring.scoreLearningAgility(learningAgility);
            const ambiguityRiskResult = Disha5Scoring.scoreAmbiguityRisk(ambiguityRisk);
            const futureOrientationResult = Disha5Scoring.scoreFutureOrientation(futureOrientation);
            const sjtResult = Disha5Scoring.scoreSjt(sjt);

            // RII inconsistency uses the union of all Likert section responses.
            const allResponses = {
                ...adaptability, ...mindset, ...decisionStyle, ...learningAgility, ...ambiguityRisk, ...futureOrientation,
            };
            const validityResult = Disha5Scoring.scoreValidity(validity, allResponses);
            const quadrant = Disha5Scoring.computeQuadrant(adaptabilityResult, ambiguityRiskResult);
            const summary = Disha5Scoring.computeSummary({
                adaptability: adaptabilityResult,
                learningAgility: learningAgilityResult,
                futureOrientation: futureOrientationResult,
                mindset: mindsetResult,
                sjt: sjtResult,
            });

            const result = {
                adaptability: adaptabilityResult,
                mindset: mindsetResult,
                decisionStyle: decisionStyleResult,
                learningAgility: learningAgilityResult,
                ambiguityRisk: ambiguityRiskResult,
                futureOrientation: futureOrientationResult,
                sjt: sjtResult,
                validity: validityResult,
                quadrant,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    adaptability, mindset, decisionStyle, learningAgility, ambiguityRisk, futureOrientation, sjt, validity,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha5Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha5Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha5Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 5 assessment submitted successfully",
                data: { submissionId: submission._id, profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Test 5 assessment submission failed" },
            };
        }
    }

    static async getDisha5Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha5Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 5 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Class 10 Stream Selection Test. Standalone assessment (not part
       of the numbered Test 1–8 battery), restricted to students currently in
       Class 10. Questions served from the code-based bank (aptitude answer
       keys / scenario "best" keys stripped). Scoring runs server-side via the
       Class-10 scoring engine.
       ===================================================================== */

    static async getDishaC10Questions(req) {
        try {
            const classGrade = req.authData?.user?.academicInfo?.classGrade;
            if (!DishaC10Scoring.isClass10(classGrade)) {
                return {
                    status: false,
                    error: {
                        status: 403,
                        message: "This assessment is available only for students currently in Class 10.",
                    },
                };
            }

            const stripAptitude = (i) => ({
                id: i.id, difficulty: i.difficulty, dim: i.dim, text: i.text, options: i.options, hint: i.hint,
            });
            const data = {
                sections: DishaC10Bank.SECTIONS,
                streams: DishaC10Bank.STREAMS,
                academic: {
                    subjects: DishaC10Bank.SUBJECTS_C10,
                    terms: DishaC10Bank.TERMS_C10,
                    enjoymentScaleNote: DishaC10Bank.ENJOYMENT_SCALE_NOTE,
                },
                aptitude: DishaC10Bank.APTITUDE_C10.map(stripAptitude),
                interests: DishaC10Bank.INTEREST_C10.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                values: DishaC10Bank.VALUES_C10.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                streamPreference: DishaC10Bank.STREAM_PREF_C10.map((p) => ({
                    id: p.id,
                    optionA: { text: p.optionA.text },
                    optionB: { text: p.optionB.text },
                })),
                context: DishaC10Bank.CONTEXT_C10,
                scenarios: DishaC10Bank.SCENARIOS_C10.map((s) => ({
                    id: s.id, title: s.title, situation: s.situation,
                    options: s.options.map((o) => ({ key: o.key, text: o.text })),
                })),
            };

            return { status: true, message: "DISHA Class 10 Stream Selection questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Class 10 questions" },
            };
        }
    }

    static async submitDishaC10Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const classGrade = req.authData?.user?.academicInfo?.classGrade;
            if (!DishaC10Scoring.isClass10(classGrade)) {
                return {
                    status: false,
                    error: {
                        status: 403,
                        message: "This assessment is available only for students currently in Class 10.",
                    },
                };
            }

            const {
                marks = {},
                enjoyment = {},
                inTheZoneSubject = null,
                aptitude = {},
                interests = {},
                values = {},
                streamPreference = {},
                context = {},
                scenarios = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const academicResult = DishaC10Scoring.scoreAcademic(marks, enjoyment, inTheZoneSubject);
            const aptitudeResult = DishaC10Scoring.scoreAptitude(aptitude);
            const interestsResult = DishaC10Scoring.scoreInterests(interests);
            const valuesResult = DishaC10Scoring.scoreValues(values);
            const streamPreferenceResult = DishaC10Scoring.scoreStreamPreference(streamPreference);
            const contextResult = DishaC10Scoring.scoreContext(context);
            const scenariosResult = DishaC10Scoring.scoreScenarios(scenarios);

            const streamResult = DishaC10Scoring.streamProbabilities({
                academic: academicResult,
                aptitude: aptitudeResult,
                interests: interestsResult,
                values: valuesResult,
                streamPreference: streamPreferenceResult,
            });
            const examReadinessResult = DishaC10Scoring.examReadiness(contextResult.examTargets, streamResult.streams);
            const summary = DishaC10Scoring.computeSummary({ streamResult });

            const result = {
                academic: academicResult,
                aptitude: aptitudeResult,
                interests: interestsResult,
                values: valuesResult,
                streamPreference: streamPreferenceResult,
                context: contextResult,
                scenarios: scenariosResult,
                streams: streamResult.streams,
                clarityGap: streamResult.clarityGap,
                explorationNeeded: streamResult.explorationNeeded,
                examReadiness: examReadinessResult,
                summary,
            };

            const payload = {
                studentId,
                profile: { classGrade },
                responses: {
                    marks,
                    enjoyment,
                    inTheZoneSubject,
                    aptitude,
                    interests,
                    values,
                    streamPreference,
                    context: {
                        parentPreference: context.parentPreference,
                        financialUrgency: context.financialUrgency,
                        geographicConstraint: context.geographicConstraint,
                        decisionStatus: context.decisionStatus,
                        examTargets: context.examTargets,
                        secretInterest: context.secretInterest,
                    },
                    scenarios,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await DishaC10Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await DishaC10Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await DishaC10Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Class 10 Stream Selection assessment submitted successfully",
                data: { submissionId: submission._id, profile: payload.profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Class 10 assessment submission failed" },
            };
        }
    }

    static async getDishaC10Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await DishaC10Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Class 10 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Class 12 Career Selection Test. Standalone assessment (not
       part of the numbered Test 1–8 battery), restricted to students
       currently in Class 12. Questions served from the code-based bank
       (aptitude answer keys / scenario "best" keys / career Holland codes
       stripped). Scoring runs server-side via the Class-12 scoring engine.
       ===================================================================== */

    static async getDishaC12Questions(req) {
        try {
            const classGrade = req.authData?.user?.academicInfo?.classGrade;
            if (!DishaC12Scoring.isClass12(classGrade)) {
                return {
                    status: false,
                    error: {
                        status: 403,
                        message: "This assessment is available only for students currently in Class 12.",
                    },
                };
            }

            const stripAptitude = (i) => ({
                id: i.id, difficulty: i.difficulty, dim: i.dim, text: i.text, options: i.options, hint: i.hint,
            });
            const data = {
                sections: DishaC12Bank.SECTIONS,
                academic: {
                    class10Subjects: DishaC12Bank.CLASS10_SUBJECTS,
                    class11Slots: DishaC12Bank.CLASS11_SLOTS,
                    class12Slots: DishaC12Bank.CLASS12_SLOTS,
                    streamSubjectHints: DishaC12Bank.STREAM_SUBJECT_HINTS,
                    entranceExamsAttempted: DishaC12Bank.ENTRANCE_EXAMS_ATTEMPTED,
                },
                aptitude: DishaC12Bank.APTITUDE_C12.map(stripAptitude),
                personality: DishaC12Bank.PERSONALITY_C12.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                interests: DishaC12Bank.INTEREST_C12.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                careerTitles: DishaC12Bank.CAREER_TITLES_C12.map((c) => ({ id: c.id, title: c.title, sector: c.sector })),
                workValues: DishaC12Bank.WORK_VALUES_C12.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                motivations: DishaC12Bank.MOTIVATIONS_C12.map((i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false })),
                lifeDesign: DishaC12Bank.LIFE_DESIGN_C12,
                context: DishaC12Bank.CONTEXT_C12,
                scenarios: DishaC12Bank.SCENARIOS_C12.map((s) => ({
                    id: s.id, title: s.title, situation: s.situation,
                    options: s.options.map((o) => ({ key: o.key, text: o.text })),
                })),
            };

            return { status: true, message: "DISHA Class 12 Career Selection questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Class 12 questions" },
            };
        }
    }

    static async submitDishaC12Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const classGrade = req.authData?.user?.academicInfo?.classGrade;
            if (!DishaC12Scoring.isClass12(classGrade)) {
                return {
                    status: false,
                    error: {
                        status: 403,
                        message: "This assessment is available only for students currently in Class 12.",
                    },
                };
            }

            const {
                class10Marks = {},
                class11Marks = {},
                class12Marks = {},
                attemptedScores = {},
                aptitude = {},
                personality = {},
                interests = {},
                careerAppeal = {},
                values = {},
                motivations = {},
                lifeDesign = {},
                context = {},
                scenarios = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const academicResult = DishaC12Scoring.scoreAcademic(class10Marks, class11Marks, class12Marks);
            const aptitudeResult = DishaC12Scoring.scoreAptitude(aptitude);
            const personalityResult = DishaC12Scoring.scorePersonality(personality);
            const interestsResult = DishaC12Scoring.scoreInterests(interests, careerAppeal);
            const valuesMotivationsResult = DishaC12Scoring.scoreValuesMotivations(values, motivations);
            const lifeDesignResult = DishaC12Scoring.scoreLifeDesign(lifeDesign);
            const contextResult = DishaC12Scoring.scoreContext(context);
            const scenariosResult = DishaC12Scoring.scoreScenarios(scenarios);

            const recommendations = DishaC12Scoring.careerRecommendations({
                interests: interestsResult,
                careerAppealById: careerAppeal,
                valuesMotivations: valuesMotivationsResult,
                lifeDesign: lifeDesignResult,
                context: contextResult,
                academic: academicResult,
                aptitude: aptitudeResult,
            });
            const examProbabilitiesResult = DishaC12Scoring.examProbabilities({
                attemptedScores,
                targetExams: contextResult.targetExam,
                academic: academicResult,
                aptitude: aptitudeResult,
            });
            const collegePathwaysResult = DishaC12Scoring.collegePathways({
                targetExams: contextResult.targetExam,
                lifeDesign: lifeDesignResult,
                context: contextResult,
            });
            const fiveYearVision = DishaC12Scoring.computeFiveYearVision({
                topCareer: recommendations[0],
                valuesMotivations: valuesMotivationsResult,
                lifeDesign: lifeDesignResult,
            });
            const summary = DishaC12Scoring.computeSummary({ recommendations, examResults: examProbabilitiesResult });

            const result = {
                academic: academicResult,
                aptitude: aptitudeResult,
                personality: personalityResult,
                interests: interestsResult,
                valuesMotivations: valuesMotivationsResult,
                lifeDesign: lifeDesignResult,
                context: contextResult,
                scenarios: scenariosResult,
                recommendations,
                examProbabilities: examProbabilitiesResult,
                collegePathways: collegePathwaysResult,
                fiveYearVision,
                summary,
            };

            const payload = {
                studentId,
                profile: { classGrade },
                responses: {
                    class10Marks,
                    class11Marks,
                    class12Marks,
                    attemptedScores,
                    aptitude,
                    personality,
                    interests,
                    careerAppeal,
                    values,
                    motivations,
                    lifeDesign,
                    context: {
                        parentPreference: context.parentPreference,
                        financialUrgency: context.financialUrgency,
                        geographicConstraint: context.geographicConstraint,
                        secretInterest: context.secretInterest,
                        careerClarity: context.careerClarity,
                        targetExam: context.targetExam,
                        financialSituation: context.financialSituation,
                        roleModelName: context.roleModelName,
                        roleModelAdmire: context.roleModelAdmire,
                    },
                    scenarios,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await DishaC12Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await DishaC12Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await DishaC12Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Class 12 Career Selection assessment submitted successfully",
                data: { submissionId: submission._id, profile: payload.profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Class 12 assessment submission failed" },
            };
        }
    }

    static async getDishaC12Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await DishaC12Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Class 12 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 6 of 8: Creative Thinking, Innovation Mindset,
       Entrepreneurial Potential & Problem-Solving Style. Questions served
       from the code-based bank (SJT moPoints / RoteConstraint reverse flags
       stripped). Scoring runs server-side via the Test-6 scoring engine.
       ===================================================================== */

    static async getDisha6Questions() {
        try {
            const stripLikert = (i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false });
            const stripSjt = (s) => ({
                id: s.id, title: s.title, competencies: s.competencies, context: s.context, scenario: s.scenario,
                options: s.options.map((o) => ({ key: o.key, text: o.text })),
            });
            const data = {
                sections: Disha6Bank.SECTIONS,
                divergentTasks: Disha6Bank.DIVERGENT_TASKS.map((t) => ({
                    id: t.id, title: t.title, timeSeconds: t.timeSeconds, prompt: t.prompt,
                    indiaContextStars: t.indiaContextStars || 0, substitutionNote: t.substitutionNote || null,
                })),
                creativeSelfReport: Disha6Bank.CREATIVE_SELF_REPORT.map(stripLikert),
                innovationMindset: Disha6Bank.INNOVATION_MINDSET.map(stripLikert),
                innovationFc: Disha6Bank.INNOVATION_FC.map((p) => ({
                    id: p.id, prompt: p.prompt,
                    optionA: { text: p.optionA.text }, optionB: { text: p.optionB.text },
                })),
                entrepreneurial: Disha6Bank.ENTREPRENEURIAL.map(stripLikert),
                problemSolvingStyle: Disha6Bank.PROBLEM_SOLVING_STYLE.map((i) => ({ id: i.id, text: i.text })),
                designSensitivity: Disha6Bank.DESIGN_SENSITIVITY.map(stripLikert),
                sjt: {
                    blockG: Disha6Bank.SJT_G.map(stripSjt),
                    blockH: Disha6Bank.SJT_H.map(stripSjt),
                },
                validity: Disha6Bank.VALIDITY.map((i) => ({ id: i.id, text: i.text })),
            };
            return { status: true, message: "DISHA Test 6 questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Test 6 questions" },
            };
        }
    }

    static async submitDisha6Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                divergentTasks = {},
                creativeSelfReport = {},
                innovationMindset = {},
                innovationFc = {},
                entrepreneurial = {},
                problemSolvingStyle = {},
                designSensitivity = {},
                sjt = {},
                validity = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const divergentTasksResult = Disha6Scoring.scoreDivergentTasks(divergentTasks);
            const creativeSelfReportResult = Disha6Scoring.scoreCreativeSelfReport(creativeSelfReport);
            const innovationMindsetResult = Disha6Scoring.scoreInnovationMindset(innovationMindset, innovationFc);
            const entrepreneurialResult = Disha6Scoring.scoreEntrepreneurial(entrepreneurial);
            const problemSolvingStyleResult = Disha6Scoring.scoreProblemSolvingStyle(problemSolvingStyle);
            const designSensitivityResult = Disha6Scoring.scoreDesignSensitivity(designSensitivity);
            const sjtResult = Disha6Scoring.scoreSjt(sjt);
            const validityResult = Disha6Scoring.scoreValidity(validity, creativeSelfReportResult);

            const cqProfile = Disha6Scoring.computeCQProfile({
                divergentTasks: divergentTasksResult,
                creativeSelfReport: creativeSelfReportResult,
                innovationMindset: innovationMindsetResult,
                designSensitivity: designSensitivityResult,
                sjt: sjtResult,
            });
            const summary = Disha6Scoring.computeSummary({
                cqProfile,
                entrepreneurial: entrepreneurialResult,
                problemSolvingStyle: problemSolvingStyleResult,
                designSensitivity: designSensitivityResult,
            });

            const result = {
                divergentTasks: divergentTasksResult,
                creativeSelfReport: creativeSelfReportResult,
                innovationMindset: innovationMindsetResult,
                entrepreneurial: entrepreneurialResult,
                problemSolvingStyle: problemSolvingStyleResult,
                designSensitivity: designSensitivityResult,
                sjt: sjtResult,
                validity: validityResult,
                cqProfile,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    divergentTasks, creativeSelfReport, innovationMindset, innovationFc,
                    entrepreneurial, problemSolvingStyle, designSensitivity, sjt, validity,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha6Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha6Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha6Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 6 assessment submitted successfully",
                data: { submissionId: submission._id, profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Test 6 assessment submission failed" },
            };
        }
    }

    static async getDisha6Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha6Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 6 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 7 of 8: Leadership Potential, Management Aptitude,
       Teamwork Skills & Organisational Fit. Questions served from the
       code-based bank (SJT moPoints, reverse flags, team-role/FC keys and
       scale names stripped). Scoring runs server-side via the Test-7 engine.
       No class restriction — available to all students.
       ===================================================================== */

    static async getDisha7Questions() {
        try {
            const stripLikert = (i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false });
            const stripSjt = (s) => ({
                id: s.id, title: s.title, competencies: s.competencies, context: s.context, scenario: s.scenario,
                options: s.options.map((o) => ({ key: o.key, text: o.text })),
            });
            const stripFc = (p) => ({
                id: p.id, prompt: p.prompt,
                optionA: { text: p.optionA.text }, optionB: { text: p.optionB.text },
            });
            const data = {
                sections: Disha7Bank.SECTIONS,
                leadershipPotential: Disha7Bank.LEADERSHIP_POTENTIAL.map(stripLikert),
                managementSkills: Disha7Bank.MANAGEMENT_SKILLS.map(stripLikert),
                teamwork: Disha7Bank.TEAMWORK.map(stripLikert),
                teamworkFc: Disha7Bank.TEAMWORK_FC.map(stripFc),
                powerOrientation: Disha7Bank.POWER_ORIENTATION.map(stripLikert),
                ethicalLeadership: Disha7Bank.ETHICAL_LEADERSHIP.map(stripLikert),
                workCulture: Disha7Bank.WORK_CULTURE.map(stripLikert),
                workCultureFc: Disha7Bank.WORK_CULTURE_FC.map(stripFc),
                leadershipFc: Disha7Bank.LEADERSHIP_FC.map(stripFc),
                sjt: {
                    blockH: Disha7Bank.SJT_H.map(stripSjt),
                    blockI: Disha7Bank.SJT_I.map(stripSjt),
                },
                validity: Disha7Bank.VALIDITY.map((i) => ({ id: i.id, text: i.text })),
            };
            return { status: true, message: "DISHA Test 7 questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Test 7 questions" },
            };
        }
    }

    static async submitDisha7Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                leadershipPotential = {},
                managementSkills = {},
                teamwork = {},
                teamworkFc = {},
                powerOrientation = {},
                ethicalLeadership = {},
                workCulture = {},
                workCultureFc = {},
                leadershipFc = {},
                sjt = {},
                validity = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const leadershipResult = Disha7Scoring.scoreLeadershipPotential(leadershipPotential);
            const managementResult = Disha7Scoring.scoreManagement(managementSkills);
            const teamworkResult = Disha7Scoring.scoreTeamwork(teamwork, teamworkFc);
            const powerResult = Disha7Scoring.scorePowerOrientation(powerOrientation, teamworkResult);
            const ethicalResult = Disha7Scoring.scoreEthicalLeadership(ethicalLeadership);
            const workCultureResult = Disha7Scoring.scoreWorkCulture(workCulture, workCultureFc);
            const leadershipFcResult = Disha7Scoring.scoreLeadershipFc(leadershipFc);
            const sjtResult = Disha7Scoring.scoreSjt(sjt);

            const lpi = Disha7Scoring.computeLPI({
                leadership: leadershipResult,
                management: managementResult,
                ethical: ethicalResult,
            });
            const style = Disha7Scoring.classifyLeadershipStyle({
                leadership: leadershipResult,
                management: managementResult,
                power: powerResult,
                ethical: ethicalResult,
                teamwork: teamworkResult,
                leadershipFc: leadershipFcResult,
            });
            const validityResult = Disha7Scoring.scoreValidity(validity, {
                ...leadershipPotential, ...managementSkills, ...teamwork,
                ...powerOrientation, ...ethicalLeadership, ...workCulture,
            }, leadershipFc);
            const criticalFlags = Disha7Scoring.computeCriticalFlags({ power: powerResult, ethical: ethicalResult });
            const summary = Disha7Scoring.computeSummary({
                lpi, style, power: powerResult, teamwork: teamworkResult,
                ethical: ethicalResult, workCulture: workCultureResult,
            });

            const result = {
                leadership: leadershipResult,
                management: managementResult,
                teamwork: teamworkResult,
                power: powerResult,
                ethical: ethicalResult,
                workCulture: workCultureResult,
                leadershipFc: leadershipFcResult,
                sjt: sjtResult,
                lpi,
                style,
                validity: validityResult,
                criticalFlags,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    leadershipPotential, managementSkills, teamwork, teamworkFc,
                    powerOrientation, ethicalLeadership, workCulture, workCultureFc,
                    leadershipFc, sjt, validity,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha7Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha7Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha7Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 7 assessment submitted successfully",
                data: { submissionId: submission._id, profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Test 7 assessment submission failed" },
            };
        }
    }

    static async getDisha7Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha7Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 7 result" },
            };
        }
    }

    /* =====================================================================
       DISHA — Test 8 of 8 (Capstone): Long-term Life Values, Work-Life
       Balance, Lifestyle Goals & Career Satisfaction Predictors. Questions
       served from the code-based bank (SJT bestFor arrays, scale names, and
       reverse flags stripped). Scoring runs server-side via the Test-8
       engine. No class restriction — available to all students.
       ===================================================================== */

    static async getDisha8Questions() {
        try {
            const stripLikert = (i) => ({ id: i.id, text: i.text, indiaSpecific: i.indiaSpecific || false });
            const stripSjt = (s) => ({
                id: s.id, title: s.title, competencies: s.competencies, context: s.context, scenario: s.scenario,
                options: s.options.map((o) => ({ key: o.key, text: o.text })),
            });
            const stripFc = (p) => ({
                id: p.id, prompt: p.prompt,
                optionA: { text: p.optionA.text }, optionB: { text: p.optionB.text },
            });
            const data = {
                sections: Disha8Bank.SECTIONS,
                lifeValues: Disha8Bank.LIFE_VALUES.map(stripLikert),
                lifeValuesRanking: Disha8Bank.LIFE_VALUES_RANKING,
                wlbPreferences: Disha8Bank.WLB_PREFERENCES.map(stripLikert),
                wlbFc: Disha8Bank.WLB_FC.map(stripFc),
                lifestyleGoals: Disha8Bank.LIFESTYLE_GOALS.map(stripLikert),
                lifeDesignOpen: Disha8Bank.LIFE_DESIGN_OPEN.map((q) => ({ id: q.id, question: q.question, format: q.format })),
                moneyMindset: Disha8Bank.MONEY_MINDSET.map(stripLikert),
                moneyFc: Disha8Bank.MONEY_FC.map(stripFc),
                socialContribution: Disha8Bank.SOCIAL_CONTRIBUTION.map(stripLikert),
                satisfactionPredictors: Disha8Bank.SATISFACTION_PREDICTORS.map(stripLikert),
                futureProjection: Disha8Bank.FUTURE_PROJECTION.map((sc) => ({
                    id: sc.id, title: sc.title, instruction: sc.instruction,
                    elements: sc.elements.map((el) => ({ id: el.id, label: el.label, spectrum: el.spectrum })),
                })),
                gp5: Disha8Bank.GP5_NON_NEGOTIABLE,
                sjt: Disha8Bank.SJT_H.map(stripSjt),
                validity: Disha8Bank.VALIDITY.map((i) => ({ id: i.id, text: i.text })),
            };
            return { status: true, message: "DISHA Test 8 questions fetched successfully", data };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "Failed to fetch DISHA Test 8 questions" },
            };
        }
    }

    static async submitDisha8Assessment(req) {
        try {
            const studentId = req.authData.user._id;
            const {
                profile = {},
                lifeValues = {},
                lifeValuesRanking = {},
                wlbPreferences = {},
                wlbFc = {},
                lifestyleGoals = {},
                lifeDesignOpen = {},
                moneyMindset = {},
                moneyFc = {},
                socialContribution = {},
                satisfactionPredictors = {},
                futureProjectionSliders = {},
                gp5 = {},
                sjt = {},
                validity = {},
                completionTimeSeconds,
            } = req.body || {};

            /* ----------------------- SCORING ----------------------- */
            const lifeValuesResult = Disha8Scoring.scoreLifeValues(lifeValues, lifeValuesRanking);
            const wlbResult = Disha8Scoring.scoreWlb(wlbPreferences, wlbFc);
            const lifestyleResult = Disha8Scoring.scoreLifestyle(lifestyleGoals, lifeDesignOpen);
            const moneyResult = Disha8Scoring.scoreMoney(moneyMindset, moneyFc);
            const purposeResult = Disha8Scoring.scorePurpose(socialContribution);
            const spiResult = Disha8Scoring.scoreSpi(satisfactionPredictors);
            const futureProjectionResult = Disha8Scoring.scoreFutureProjection(futureProjectionSliders, gp5);
            const sjtResult = Disha8Scoring.scoreSjtValuesAlignment(sjt, lifeValuesResult.top5);
            const validityResult = Disha8Scoring.scoreValidity(validity, { ...lifeValues, ...wlbPreferences });
            const regretRiskResult = Disha8Scoring.computeRegretRiskFactors({
                wlb: wlbResult, sjtAlignment: sjtResult, moneyProfile: moneyResult, purpose: purposeResult,
            });
            const summary = Disha8Scoring.computeSummary({
                lifeValues: lifeValuesResult, wlb: wlbResult, purpose: purposeResult,
                spi: spiResult, moneyProfile: moneyResult, regretRisk: regretRiskResult,
            });

            const result = {
                lifeValues: lifeValuesResult,
                wlb: wlbResult,
                lifestyle: lifestyleResult,
                money: moneyResult,
                purpose: purposeResult,
                spi: spiResult,
                futureProjection: futureProjectionResult,
                sjt: sjtResult,
                validity: validityResult,
                regretRisk: regretRiskResult,
                summary,
            };

            const payload = {
                studentId,
                profile,
                responses: {
                    lifeValues, lifeValuesRanking, wlbPreferences, wlbFc,
                    lifestyleGoals, lifeDesignOpen, moneyMindset, moneyFc,
                    socialContribution, satisfactionPredictors,
                    futureProjectionSliders, gp5, sjt, validity,
                },
                result,
                completionTimeSeconds: completionTimeSeconds || null,
                submittedAt: new Date(),
            };

            const existing = await Disha8Assessment.findOne({ studentId });
            let submission;
            if (existing) {
                submission = await Disha8Assessment.findByIdAndUpdate(
                    existing._id,
                    { ...payload, $inc: { attemptNumber: 1 } },
                    { new: true }
                );
            } else {
                submission = await Disha8Assessment.create({ ...payload, attemptNumber: 1 });
            }

            return {
                status: true,
                message: "DISHA Test 8 assessment submitted successfully",
                data: { submissionId: submission._id, profile, result },
            };
        } catch (error) {
            return {
                status: false,
                error: { status: error.status || 500, message: error.message || "DISHA Test 8 assessment submission failed" },
            };
        }
    }

    static async getDisha8Result(req) {
        try {
            const studentId = req.authData.user._id;
            const record = await Disha8Assessment.findOne({ studentId })
                .sort({ submittedAt: -1 })
                .lean();

            if (!record) {
                return { status: true, data: null };
            }

            return { status: true, data: record };
        } catch (error) {
            return {
                status: false,
                error: { status: 500, message: "Failed to fetch DISHA Test 8 result" },
            };
        }
    }
}

module.exports = PsychometricService;