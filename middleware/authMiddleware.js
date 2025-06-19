import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/responseHandler.js";

export const checkLogin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendResponse(res, 401, { error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return sendResponse(res, 401, { error: "Invalid token" });
  }
};
