// File: backend/controllers/answerController.js
import { Answer, User, Question, Rating } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

// Controller to fetch answers for a question with pagination
export const getAnswers = async (req, res) => {
  try {
    // Extract question ID from URL parameters
    const { questionid } = req.params;
    // Extract page and limit from query parameters, default to page 1 and 5 answers per page
    const { page = 1, limit = 5 } = req.query;
    // Get authenticated user's ID
    const userId = req.user?.userid;

    // Validate question ID presence
    if (!questionid) {
      return sendResponse(res, 400, {
        success: false,
        error: "Question ID is required",
      });
    }

    // Check if the question exists
    const question = await Question.findOne({ where: { questionid } });
    if (!question) {
      return sendResponse(res, 404, {
        success: false,
        error: "Question not found",
      });
    }

    // Calculate offset for pagination (e.g., page 2, limit 5 -> offset = (2-1)*5 = 5)
    const offset = (parseInt(page) - 1) * parseInt(limit);
    // Ensure limit is a number
    const limitValue = parseInt(limit);

    // Fetch total count of answers for the question
    const totalAnswers = await Answer.count({ where: { questionid } });
    // Calculate total pages (e.g., 12 answers, limit 5 -> ceil(12/5) = 3 pages)
    const totalPages = Math.ceil(totalAnswers / limitValue);

    // Fetch paginated answers with associated user and rating data
    const answers = await Answer.findAll({
      where: { questionid },
      include: [
        {
          model: User,
          attributes: ["username"],
          as: "User",
        },
        {
          model: Rating,
          as: "Ratings",
          attributes: ["rating"],
          include: [
            {
              model: User,
              attributes: ["userid"],
              as: "Rater",
            },
          ],
        },
      ],
      order: [["created_at", "ASC"]], // Sort answers by creation date
      limit: limitValue, // Limit number of answers per page
      offset, // Skip records based on page number
    });

    // Format answers with user rating and average rating
    const formattedAnswers = answers.map((answer) => {
      const ratings = answer.Ratings || [];
      // Find the authenticated user's rating for this answer
      const userRating =
        ratings.find((r) => r.Rater?.userid === userId)?.rating || 0;
      // Calculate average rating
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        answerid: answer.answerid,
        questionid: answer.questionid,
        userid: answer.userid,
        username: answer.User?.username,
        answer: answer.answer,
        created_at: answer.created_at,
        userRating,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingCount: ratings.length,
      };
    });

    // Send response with paginated answers and metadata
    sendResponse(res, 200, {
      success: true,
      answers: formattedAnswers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAnswers,
        limit: limitValue,
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching answers:", error);
    // Send error response
    sendResponse(res, 500, {
      success: false,
      error: "Failed to fetch answers",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Controller to create a new answer (unchanged, included for completeness)
export const createAnswer = async (req, res) => {
  try {
    // Extract question ID and answer content from request body
    const { questionid, answer } = req.body;
    // Get authenticated user's ID
    const { userid } = req.user;

    // Validate required fields
    if (!answer || !questionid) {
      return sendResponse(res, 400, {
        success: false,
        error: "Answer content and question ID are required",
      });
    }

    // Check if the question exists
    const question = await Question.findOne({ where: { questionid } });
    if (!question) {
      return sendResponse(res, 404, {
        success: false,
        error: "Question not found",
      });
    }

    // Create new answer in the database
    const newAnswer = await Answer.create({
      questionid,
      userid,
      answer,
    });

    // Send success response with the created answer
    sendResponse(res, 201, {
      success: true,
      message: "Answer created successfully",
      answer: {
        answerid: newAnswer.answerid,
        questionid: newAnswer.questionid,
        userid: newAnswer.userid,
        answer: newAnswer.answer,
        created_at: newAnswer.created_at,
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error creating answer:", error);
    // Send error response
    sendResponse(res, 500, {
      success: false,
      error: "Failed to create answer",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
