import { Op, literal, fn, col } from "sequelize";
import { Question, User, Tag, Category } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

export const searchQuestions = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!query) {
      return sendResponse(res, 400, { error: "Search query is required" });
    }

    // Normalize query: split into words, escape special characters, and create tsquery
    const words = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.replace(/'/g, "''")); // Escape single quotes for SQL
    const tsQuery = words.map((word) => `${word}:*`).join(" | "); // Prefix search with OR

    const { count, rows } = await Question.findAndCountAll({
      where: {
        [Op.or]: [
          // Full-text search on title and description
          literal(
            `to_tsvector('english', "Question"."title" || ' ' || "Question"."description") @@ to_tsquery('english', :tsQuery)`
          ),
          // Subquery for tags
          {
            id: {
              [Op.in]: literal(`
                (SELECT questionid FROM questiontag
                 JOIN tagtable ON questiontag.tagid = tagtable.id
                 WHERE to_tsvector('english', tagtable.name) @@ to_tsquery('english', :tsQuery))
              `),
            },
          },
          // Subquery for category
          {
            categoryid: {
              [Op.in]: literal(`
                (SELECT id FROM categorytable
                 WHERE to_tsvector('english', categorytable.name) @@ to_tsquery('english', :tsQuery))
              `),
            },
          },
        ],
      },
      include: [
        { model: User, attributes: ["username"] },
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ["name"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
      attributes: {
        include: [
          // Add relevance score for ranking
          [
            literal(`
              ts_rank(
                to_tsvector('english', "Question"."title" || ' ' || "Question"."description"),
                to_tsquery('english', :tsQuery)
              )
            `),
            "relevance",
          ],
        ],
      },
      replacements: { tsQuery }, // Pass tsQuery as a replacement to prevent SQL injection
      offset,
      limit: parseInt(limit),
      order: [
        [literal("relevance"), "DESC"], // Sort by relevance first
        ["created_at", "DESC"], // Then by recency
      ],
      distinct: true, // Avoid duplicate rows from joins
    });

    const questions = rows.map((q) => ({
      id: q.id,
      questionid: q.questionid,
      title: q.title,
      description: q.description,
      username: q.User?.username,
      category: q.Category?.name,
      created_at: q.created_at,
      tags: q.Tags?.map((tag) => tag.name) || [],
      relevance: q.dataValues.relevance, // Optional: include relevance score
    }));

    const totalPages = Math.ceil(count / parseInt(limit));
    sendResponse(res, 200, { questions, totalPages });
  } catch (error) {
    console.error("Search questions error:", error);
    sendResponse(res, 500, { error: "Failed to search questions" });
  }
};
