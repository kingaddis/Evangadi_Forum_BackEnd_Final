import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    answerid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "answertable",
        key: "answerid",
      },
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usertable",
        key: "userid",
      },
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ratingtable",
    timestamps: false,
  }
);

export default Rating;