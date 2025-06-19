import express from "express";
import { searchQuestions } from "../controllers/searchController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", checkLogin, searchQuestions);

export default router;
