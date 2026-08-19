const { Forbidden, NotFound } = require("http-errors");
const mongoose = require("mongoose");
const Career = require("../models/career.model");
const Industry = require("../models/industry.model");

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class CareerService {

    static async createCareer(payload) {
        try {
            const { user } = payload.authData;

            /* ----------------------------------
            1. AUTHORIZATION
            -----------------------------------*/
            if (user.role !== "superadmin") {
                throw Forbidden("You are not allowed to create careers");
            }

            /* ----------------------------------
            2. EXTRACT & VALIDATE BODY
            -----------------------------------*/
            const {
                title,
                industry,
                description,
                progression,
                keySkills,
                topInstitutionsIndia,
                globalPathways
            } = payload.body;

            if (!title) throw Forbidden("Career title is required");
            if (!industry) throw Forbidden("Industry is required");
            if (!description) throw Forbidden("Description is required");
            if (!progression) throw Forbidden("Progression is required");
            if (!Array.isArray(keySkills) || keySkills.length === 0) {
                throw Forbidden("At least one key skill is required");
            }

            /* ----------------------------------
            3. RESOLVE INDUSTRY (create on demand)
            -----------------------------------*/
            const industryDoc = await CareerService.resolveIndustry(industry);

            /* ----------------------------------
            4. CREATE CAREER
            -----------------------------------*/
            const career = await Career.create({
                title,
                industry: industryDoc.name,
                industryId: industryDoc._id,
                description,
                progression,
                keySkills,
                topInstitutionsIndia: topInstitutionsIndia || [],
                globalPathways: globalPathways || [],
                createdBy: user._id
            });

            return {
                status: true,
                data: career.toObject(),
                message: "Career created successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    static async getCareer(payload) {
        try {
            /* ----------------------------------
            1. EXTRACT QUERY PARAMS
            -----------------------------------*/
            const {
                keyword,
                industry,
                industryId,
                page = 1,
                limit = 50
            } = payload.query;

            const skip = (Number(page) - 1) * Number(limit);

            /* ----------------------------------
            2. BUILD QUERY
            -----------------------------------*/
            const query = { isDeleted: false };

            /* Prefer the id filter — it survives industry renames */
            if (industryId) {
                if (!mongoose.Types.ObjectId.isValid(industryId)) {
                    throw Forbidden("Invalid industry id");
                }
                query.industryId = new mongoose.Types.ObjectId(industryId);
            } else if (industry) {
                query.industry = industry;
            }

            if (keyword) {
                query.$or = [
                    { title: { $regex: keyword, $options: "i" } },
                    { industry: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                    { keySkills: { $regex: keyword, $options: "i" } }
                ];
            }

            /* ----------------------------------
            3. FETCH DATA
            -----------------------------------*/
            const [careers, total] = await Promise.all([
                Career.find(query)
                    .populate("industryId", "name description")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),

                Career.countDocuments(query)
            ]);

            return {
                status: true,
                data: careers,
                message: "Careers fetched successfully",
                error: null,
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)) || 1
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    static async updateCareer(payload) {
        try {
            const { user } = payload.authData;

            if (user.role !== "superadmin") {
                throw Forbidden("You are not allowed to update careers");
            }

            const { id } = payload.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw Forbidden("Invalid career id");
            }

            const career = await Career.findOne({ _id: id, isDeleted: false });
            if (!career) throw NotFound("Career not found");

            const {
                title,
                industry,
                description,
                progression,
                keySkills,
                topInstitutionsIndia,
                globalPathways
            } = payload.body;

            if (!title) throw Forbidden("Career title is required");
            if (!industry) throw Forbidden("Industry is required");
            if (!description) throw Forbidden("Description is required");
            if (!progression) throw Forbidden("Progression is required");
            if (!Array.isArray(keySkills) || keySkills.length === 0) {
                throw Forbidden("At least one key skill is required");
            }

            const industryDoc = await CareerService.resolveIndustry(industry);

            career.set({
                title,
                industry: industryDoc.name,
                industryId: industryDoc._id,
                description,
                progression,
                keySkills,
                topInstitutionsIndia: topInstitutionsIndia || [],
                globalPathways: globalPathways || [],
                updatedBy: user._id
            });

            await career.save();

            return {
                status: true,
                data: career.toObject(),
                message: "Career updated successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    static async deleteCareer(payload) {
        try {
            const { user } = payload.authData;

            if (user.role !== "superadmin") {
                throw Forbidden("You are not allowed to delete careers");
            }

            const { id } = payload.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw Forbidden("Invalid career id");
            }

            const career = await Career.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true, updatedBy: user._id },
                { new: true }
            );

            if (!career) throw NotFound("Career not found");

            return {
                status: true,
                data: { _id: career._id },
                message: "Career deleted successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    /* ==========================================
       INDUSTRIES
       Careers carry both `industryId` (the link)
       and `industry` (denormalised name, kept in
       sync so older clients keep working).
    ==========================================*/

    /** Find an industry by name, creating it if it does not exist yet. */
    static async resolveIndustry(name) {
        const clean = String(name || "").trim();
        if (!clean) throw Forbidden("Industry is required");

        return Industry.findOneAndUpdate(
            { name: { $regex: `^${escapeRegex(clean)}$`, $options: "i" } },
            { $setOnInsert: { name: clean } },
            { new: true, upsert: true }
        );
    }

    static async getIndustries(payload) {
        try {
            /* ----------------------------------
            1. BACKFILL: any industry used by a career
               but missing from the collection
            -----------------------------------*/
            const usedNames = await Career.distinct("industry", {
                isDeleted: false
            });

            const existing = await Industry.find({}).select("name");
            const existingNames = new Set(existing.map((i) => i.name));

            const missing = usedNames
                .filter((name) => name && !existingNames.has(name))
                .map((name) => ({ name }));

            if (missing.length > 0) {
                await Industry.insertMany(missing, { ordered: false });
            }

            /* ----------------------------------
            2. FETCH WITH CAREER COUNTS
            -----------------------------------*/
            const industries = await Industry.find({}).sort({ name: 1 }).lean();

            const [byId, byName] = await Promise.all([
                Career.aggregate([
                    { $match: { isDeleted: false, industryId: { $ne: null } } },
                    { $group: { _id: "$industryId", count: { $sum: 1 } } }
                ]),
                Career.aggregate([
                    { $match: { isDeleted: false, industryId: null } },
                    { $group: { _id: "$industry", count: { $sum: 1 } } }
                ])
            ]);

            const countById = byId.reduce((acc, c) => {
                acc[String(c._id)] = c.count;
                return acc;
            }, {});
            const countByName = byName.reduce((acc, c) => {
                acc[c._id] = c.count;
                return acc;
            }, {});

            const data = industries.map((i) => ({
                ...i,
                /* legacy careers not yet linked by id still get counted */
                careerCount: (countById[String(i._id)] || 0) + (countByName[i.name] || 0)
            }));

            return {
                status: true,
                data,
                message: "Industries fetched successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    static async createIndustry(payload) {
        try {
            const { user } = payload.authData;

            if (user.role !== "superadmin") {
                throw Forbidden("You are not allowed to create industries");
            }

            const name = (payload.body.name || "").trim();
            const description = payload.body.description;

            if (!name) throw Forbidden("Industry name is required");

            const duplicate = await Industry.findOne({
                name: { $regex: `^${escapeRegex(name)}$`, $options: "i" }
            });
            if (duplicate) throw Forbidden("Industry already exists");

            const industry = await Industry.create({ name, description });

            return {
                status: true,
                data: industry.toObject(),
                message: "Industry created successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    static async updateIndustry(payload) {
        try {
            const { user } = payload.authData;

            if (user.role !== "superadmin") {
                throw Forbidden("You are not allowed to update industries");
            }

            const { id } = payload.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw Forbidden("Invalid industry id");
            }

            const industry = await Industry.findById(id);
            if (!industry) throw NotFound("Industry not found");

            const name = (payload.body.name || "").trim();
            if (!name) throw Forbidden("Industry name is required");

            const duplicate = await Industry.findOne({
                _id: { $ne: industry._id },
                name: { $regex: `^${escapeRegex(name)}$`, $options: "i" }
            });
            if (duplicate) throw Forbidden("Another industry with that name already exists");

            const previousName = industry.name;

            industry.name = name;
            if (payload.body.description !== undefined) {
                industry.description = payload.body.description;
            }
            await industry.save();

            /* Careers denormalise the industry name — keep them in sync */
            if (previousName !== name) {
                await Career.updateMany(
                    { $or: [{ industryId: industry._id }, { industry: previousName }] },
                    { industry: name, industryId: industry._id, updatedBy: user._id }
                );
            }

            return {
                status: true,
                data: industry.toObject(),
                message: "Industry updated successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

    static async deleteIndustry(payload) {
        try {
            const { user } = payload.authData;

            if (user.role !== "superadmin") {
                throw Forbidden("You are not allowed to delete industries");
            }

            const { id } = payload.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw Forbidden("Invalid industry id");
            }

            const industry = await Industry.findById(id);
            if (!industry) throw NotFound("Industry not found");

            const inUse = await Career.countDocuments({
                $or: [{ industryId: industry._id }, { industry: industry.name }],
                isDeleted: false
            });

            if (inUse > 0) {
                throw Forbidden(
                    `Cannot delete: ${inUse} career(s) still belong to this industry`
                );
            }

            await industry.deleteOne();

            return {
                status: true,
                data: { _id: industry._id },
                message: "Industry deleted successfully",
                error: null
            };

        } catch (error) {
            return { status: false, data: null, message: error.message, error };
        }
    }

}

module.exports = CareerService;
