// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";
// import questionRoutes from "./routes/questionRoutes.js";
// import answerRoutes from "./routes/answerRoutes.js";
// import contentRoutes from "./routes/contentRoutes.js";
// import ratingRoutes from "./routes/ratingRoutes.js";
// import tagRoutes from "./routes/tagRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import searchRoutes from "./routes/searchRoutes.js";
// import sequelize from "./config/database.js";

// dotenv.config();

// const app = express();

// // Middleware
// // CORS options to allow all origins
// const corsOptions = {
//   origin: "*", // 🔓 Allow any origin
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true, // ⚠️ Note: this has no effect when origin is "*"
// };

// app.use(cors(corsOptions));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/question", questionRoutes);
// app.use("/api/answer", answerRoutes);
// app.use("/api/content", contentRoutes);
// app.use("/api/rating", ratingRoutes);
// app.use("/api/tag", tagRoutes);
// app.use("/api/category", categoryRoutes);
// app.use("/api/search", searchRoutes);

// // Health check
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error("Server error:", err);
//   res.status(500).json({
//     status: "error",
//     error: "Internal server error",
//     details: process.env.NODE_ENV === "development" ? err.message : undefined,
//   });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, async () => {
//   console.log(`Server running on port ${PORT}`);
//   try {
//     await sequelize.authenticate();
//     console.log("Database connected");
//   } catch (error) {
//     console.error("Database connection failed:", error);
//   }
// });
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import sequelize from "./config/database.js";

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ADDED ROOT ROUTE HERE =====
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the QuizApp API!",
    documentation: "https://github.com/your-repo/docs",
    endpoints: {
      auth: "/api/auth",
      questions: "/api/question",
      answers: "/api/answer",
      content: "/api/content",
      ratings: "/api/rating",
      tags: "/api/tag",
      categories: "/api/category",
      search: "/api/search"
    },
    healthCheck: "/health"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/answer", answerRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/tag", tagRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/search", searchRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    status: "error",
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
app.get('/api/connection-test', (req, res) => {
  console.log('Received headers:', req.headers);
  res.json({
    status: 'success',
    message: 'Backend is connected!',
    headers: {
      authorization: req.headers.authorization || 'No token provided',
      origin: req.headers.origin || 'No origin header'
    },
    timestamp: new Date().toISOString()
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});