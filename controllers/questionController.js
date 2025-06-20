import { Op } from "sequelize";
import { Question, User, Tag, Category } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

export const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    let include = [
      { model: User, attributes: ["username"], as: "User" },
      {
        model: Tag,
        through: { attributes: [] },
        attributes: ["name"],
        as: "Tags",
      },
    ];

    // Build search conditions for title, description, and tags
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
      // Add tag search condition
      include[1].where = { name: { [Op.iLike]: `%${search}%` } };
    }

    let categoryCondition = {};
    if (category) {
      const categoryRecord = await Category.findOne({
        where: { name: { [Op.iLike]: category } },
      });
      if (categoryRecord) {
        categoryCondition = { categoryid: categoryRecord.id };
      } else {
        return sendResponse(res, 200, { questions: [], totalPages: 0 });
      }
    }

    const { count, rows } = await Question.findAndCountAll({
      where: { ...where, ...categoryCondition },
      attributes: [
        "id",
        "questionid",
        "title",
        "description",
        "created_at",
        "updated_at",
      ],
      include,
      offset,
      limit: parseInt(limit),
      order: [["created_at", "DESC"]],
      distinct: true, // Ensure unique questions when filtering by tags
    });

    const questions = rows.map((q) => ({
      id: q.id,
      questionid: q.questionid,
      title: q.title,
      description: q.description,
      username: q.User?.username || "Unknown",
      created_at: q.created_at,
      updated_at: q.updated_at,
      tags: q.Tags?.map((tag) => tag.name) || [],
    }));

    const totalPages = Math.ceil(count / parseInt(limit));
    sendResponse(res, 200, { questions, totalPages });
  } catch (error) {
    console.error("Get questions error:", error);
    sendResponse(res, 500, {
      error: "Failed to fetch questions",
      details: error.message,
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { questionid } = req.params;
    const question = await Question.findOne({
      where: { questionid },
      attributes: [
        "id",
        "questionid",
        "title",
        "description",
        "created_at",
        "updated_at",
      ],
      include: [
        { model: User, attributes: ["userid", "username"], as: "User" },
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ["name"],
          as: "Tags",
        },
        { model: Category, attributes: ["name"], as: "Category" },
      ],
    });

    if (!question) {
      return sendResponse(res, 404, { error: "Question not found" });
    }

    sendResponse(res, 200, {
      id: question.id,
      questionid: question.questionid,
      userid: question.User?.userid,
      username: question.User?.username || "Unknown",
      title: question.title,
      description: question.description,
      created_at: question.created_at,
      updated_at: question.updated_at,
      tags: question.Tags?.map((tag) => tag.name) || [],
      category: question.Category?.name,
    });
  } catch (error) {
    console.error("Get question error:", error);
    sendResponse(res, 500, {
      error: "Failed to fetch question",
      details: error.message,
    });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const { userid } = req.user;

    if (!title?.trim() || !description?.trim() || !category) {
      return sendResponse(res, 400, {
        error: "Title, description, and category are required",
      });
    }

    if (
      tags &&
      (!Array.isArray(tags) || tags.some((t) => !t?.trim() || t.length > 50))
    ) {
      return sendResponse(res, 400, {
        error:
          "Tags must be an array of non-empty strings, max 50 characters each",
      });
    }

    const categoryRecord = await Category.findOne({
      where: { name: category.trim() },
    });
    if (!categoryRecord) {
      return sendResponse(res, 400, { error: "Invalid category" });
    }

    const question = await Question.create({
      userid,
      categoryid: categoryRecord.id,
      title: title.trim(),
      description: description.trim(),
    });

    let tagRecords = [];
    if (tags && tags.length > 0) {
      tagRecords = await Promise.all(
        tags.map(async (tagName) => {
          const trimmedTag = tagName.trim();
          const [tag] = await Tag.findOrCreate({
            where: { name: trimmedTag },
            defaults: { name: trimmedTag },
          });
          return tag;
        })
      );
      await question.setTags(tagRecords);
    }

    sendResponse(res, 201, {
      message: "Question created successfully",
      questionid: question.questionid,
      tags: tagRecords.map((tag) => tag.name),
    });
  } catch (error) {
    console.error("Create question error:", error);
    sendResponse(res, 500, {
      error: "Failed to create question",
      details: error.message,
    });
  }
};
