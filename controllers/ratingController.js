import { Rating, Answer, User } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";
import sequelize from "../config/database.js";

export const submitRating = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { answerid, rating } = req.body;
    const { userid } = req.user;

    if (!answerid || rating == null || rating < 0 || rating > 5) {
      await transaction.rollback();
      return sendResponse(res, 400, {
        success: false,
        error: "Invalid answer ID or rating value (must be between 0-5)",
      });
    }

    if (rating % 0.5 !== 0) {
      await transaction.rollback();
      return sendResponse(res, 400, {
        success: false,
        error: "Rating must be in 0.5 increments (0, 0.5, 1, 1.5, etc.)",
      });
    }

    const answer = await Answer.findOne({
      where: { answerid: answerid },
      include: [
        {
          model: User,
          attributes: ["userid"],
          as: "User",
        },
      ],
      transaction,
    });

    if (!answer) {
      await transaction.rollback();
      return sendResponse(res, 404, {
        success: false,
        error: "Answer not found",
      });
    }

    if (answer.userid === userid) {
      await transaction.rollback();
      return sendResponse(res, 403, {
        success: false,
        error: "You cannot rate your own answer",
      });
    }

    const [ratingRecord, created] = await Rating.findOrCreate({
      where: {
        answerid: answerid,
        userId: userid,
      },
      defaults: {
        rating,
        answerid,
        userId: userid,
      },
      transaction,
    });

    if (!created) {
      await ratingRecord.update({ rating }, { transaction });
    }

    const allRatings = await Rating.findAll({
      where: { answerid: answerid },
      attributes: ["rating"],
      transaction,
    });

    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    await transaction.commit();

    sendResponse(res, 200, {
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingCount: allRatings.length,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Submit rating error:", error);
    sendResponse(res, 500, {
      success: false,
      error: "Failed to submit rating",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { answerid } = req.params;
    const { userid } = req.user;

    if (!answerid) {
      return sendResponse(res, 400, {
        success: false,
        error: "Answer ID is required",
      });
    }

    const rating = await Rating.findOne({
      where: {
        answerid: answerid,
        userId: userid,
      },
      attributes: ["rating"],
    });

    sendResponse(res, 200, {
      success: true,
      rating: rating?.rating || 0,
    });
  } catch (error) {
    console.error("Get user rating error:", error);
    sendResponse(res, 500, {
      success: false,
      error: "Failed to get user rating",
    });
  }
};
