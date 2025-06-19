import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const QuestionTag = sequelize.define(
  "QuestionTag",
  {
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "questiontable",
        key: "id",
      },
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tagtable",
        key: "id",
      },
    },
  },
  {
    tableName: "Questiontag",
    timestamps: false,
  }
);

export default QuestionTag;
