import express from "express";
import {
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/:id", checkLogin, updateContent);
router.delete("/:id", checkLogin, deleteContent);

export default router;
