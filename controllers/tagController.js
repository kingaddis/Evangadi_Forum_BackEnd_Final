import { Tag } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

export const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({ attributes: ["id", "name"] });
    sendResponse(res, 200, { tags });
  } catch (error) {
    console.error("Get tags error:", error);
    sendResponse(res, 500, { error: "Failed to fetch tags" });
  }
};
