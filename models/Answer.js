import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Answer = sequelize.define(
  "Answer",
  {
    answerid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4, // Added default for PostgreSQL
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "answertable",
    timestamps: false,
    underscored: true, // Added for consistent naming with PostgreSQL conventions
  }
);

export default Answer;
