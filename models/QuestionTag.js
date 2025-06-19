import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const QuestionTag = sequelize.define(
  "QuestionTag",
  {
    questionid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "questiontable",
        key: "id",
      },
    },
    tagid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tagtable",
        key: "id",
      },
    },
  },
  {
    tableName: "questiontag",
    timestamps: false,
  }
);

export default QuestionTag;
