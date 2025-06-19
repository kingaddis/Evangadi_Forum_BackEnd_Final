import sequelize from "../config/database.js";
import User from "./User.js";
import Question from "./Question.js";
import Answer from "./Answer.js";
import Rating from "./Rating.js";
import Tag from "./Tag.js";
import Category from "./Category.js";
import QuestionTag from "./QuestionTag.js";

Question.belongsToMany(Tag, {
  through: QuestionTag,
  foreignKey: "questionId",
  otherKey: "tagId",
});
Tag.belongsToMany(Question, {
  through: QuestionTag,
  foreignKey: "tagId",
  otherKey: "questionId",
});

Question.belongsTo(User, { foreignKey: "userid", targetKey: "userid" });
Question.belongsTo(Category, { foreignKey: "categoryId", targetKey: "id" });

Answer.belongsTo(User, { foreignKey: "userid", targetKey: "userid" });
Answer.belongsTo(Question, {
  foreignKey: "questionid",
  targetKey: "questionid",
});
Answer.hasMany(Rating, {
  foreignKey: "answerId",
  sourceKey: "answerid",
  as: "Ratings",
});
Rating.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "userid",
  as: "Rater",
});
Rating.belongsTo(Answer, { foreignKey: "answerId", targetKey: "answerid" });

export { User, Question, QuestionTag, Answer, Rating, Tag, Category };
