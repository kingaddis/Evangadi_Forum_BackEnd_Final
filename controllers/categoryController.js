import { Category } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ attributes: ["id", "name"] });
    sendResponse(res, 200, { categories });
  } catch (error) {
    console.error("Get categories error:", error);
    sendResponse(res, 500, { error: "Failed to fetch categories" });
  }
};
