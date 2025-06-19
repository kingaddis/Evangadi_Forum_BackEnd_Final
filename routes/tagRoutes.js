import express from "express";
import { getTags } from "../controllers/tagController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", checkLogin, getTags);

export default router;
