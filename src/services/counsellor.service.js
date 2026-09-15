const { Forbidden, NotFound, BadRequest } = require("http-errors");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const AwsClient = require("../config/awsconfig");
const Counsellor = require("../models/counsellor.model");
const { uploadToS3 } = require("../utils/uploadToS3");
const { deleteFromS3 } = require("../utils/deleteFromS3");

const ADMIN_ROLES = ["superadmin", "admin"];

const assertAdmin = (user) => {
  if (!ADMIN_ROLES.includes(user?.role)) {
    throw Forbidden("You are not allowed to manage counsellors");
  }
};

// Keywords arrive as a JSON string (multipart) or an array / comma-separated string
const parseKeywords = (keywords) => {
  if (keywords === undefined) return undefined;
  let list = keywords;
  if (typeof keywords === "string") {
    try {
      list = JSON.parse(keywords);
    } catch (e) {
      list = keywords.split(",");
    }
  }
  if (!Array.isArray(list)) list = [list];
  return [...new Set(list.map((k) => String(k).trim()).filter(Boolean))];
};

const withImageUrl = async (counsellor) => {
  const obj = counsellor.toObject ? counsellor.toObject() : counsellor;
  obj.profileImage = null;
  if (obj.profileImageKey) {
    try {
      obj.profileImage = await getSignedUrl(
        AwsClient.s3Instance,
        new GetObjectCommand({ Bucket: process.env.BUCKET, Key: obj.profileImageKey }),
        { expiresIn: 3600 }
      );
    } catch (err) {
      console.error("Error generating signed URL for counsellor image:", err.message);
    }
  }
  return obj;
};

const uploadProfileImage = async (req) => {
  if (!req.file) return null;
  const [uploaded] = await uploadToS3({
    files: [req.file],
    userId: req.authData.user._id,
    folder: "counsellors/profile"
  });
  return uploaded.key;
};

class CounsellorService {
  static async createCounsellor(req) {
    let uploadedKey = null;
    try {
      assertAdmin(req.authData.user);

      const { fullName, title, shortDescription } = req.body;
      if (!fullName || !title) throw BadRequest("Full name and title are required");

      uploadedKey = await uploadProfileImage(req);

      const counsellor = await Counsellor.create({
        fullName,
        title,
        shortDescription: shortDescription || "",
        keywords: parseKeywords(req.body.keywords) || [],
        profileImageKey: uploadedKey,
        createdBy: req.authData.user._id
      });

      return {
        status: true,
        message: "Counsellor created successfully",
        data: await withImageUrl(counsellor),
        error: null
      };
    } catch (error) {
      if (uploadedKey) await deleteFromS3(uploadedKey);
      return { status: false, data: null, message: error.message, error };
    }
  }

  static async getCounsellors(req) {
    try {
      const { keyword } = req.query;
      const filter = {};
      if (keyword) {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ fullName: regex }, { title: regex }, { keywords: regex }];
      }

      const counsellors = await Counsellor.find(filter).sort({ createdAt: -1 });
      const data = await Promise.all(counsellors.map(withImageUrl));

      return { status: true, message: "Counsellors fetched successfully", data, error: null };
    } catch (error) {
      return { status: false, data: null, message: error.message, error };
    }
  }

  static async getCounsellorById(req) {
    try {
      const counsellor = await Counsellor.findById(req.params.id);
      if (!counsellor) throw NotFound("Counsellor not found");
      return {
        status: true,
        message: "Counsellor fetched successfully",
        data: await withImageUrl(counsellor),
        error: null
      };
    } catch (error) {
      return { status: false, data: null, message: error.message, error };
    }
  }

  static async updateCounsellor(req) {
    let uploadedKey = null;
    try {
      assertAdmin(req.authData.user);

      const counsellor = await Counsellor.findById(req.params.id);
      if (!counsellor) throw NotFound("Counsellor not found");

      const { fullName, title, shortDescription, removeImage } = req.body;
      if (fullName !== undefined) counsellor.fullName = fullName;
      if (title !== undefined) counsellor.title = title;
      if (shortDescription !== undefined) counsellor.shortDescription = shortDescription;
      const keywords = parseKeywords(req.body.keywords);
      if (keywords !== undefined) counsellor.keywords = keywords;

      const previousKey = counsellor.profileImageKey;
      uploadedKey = await uploadProfileImage(req);
      if (uploadedKey) {
        counsellor.profileImageKey = uploadedKey;
      } else if (removeImage === "true" || removeImage === true) {
        counsellor.profileImageKey = null;
      }

      await counsellor.save();

      if (previousKey && previousKey !== counsellor.profileImageKey) {
        await deleteFromS3(previousKey);
      }

      return {
        status: true,
        message: "Counsellor updated successfully",
        data: await withImageUrl(counsellor),
        error: null
      };
    } catch (error) {
      if (uploadedKey) await deleteFromS3(uploadedKey);
      return { status: false, data: null, message: error.message, error };
    }
  }

  static async deleteCounsellor(req) {
    try {
      assertAdmin(req.authData.user);

      const counsellor = await Counsellor.findByIdAndDelete(req.params.id);
      if (!counsellor) throw NotFound("Counsellor not found");
      if (counsellor.profileImageKey) await deleteFromS3(counsellor.profileImageKey);

      return { status: true, message: "Counsellor deleted successfully", data: null, error: null };
    } catch (error) {
      return { status: false, data: null, message: error.message, error };
    }
  }
}

module.exports = CounsellorService;
