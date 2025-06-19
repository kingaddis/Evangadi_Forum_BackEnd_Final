import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "id",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "name",
    },
  },
  {
    tableName: "categorytable",
    timestamps: false, // Disable automatic timestamps
  }
);

export default Category;