
// import { Pool } from 'pg';
// import dotenv from 'dotenv';
// dotenv.config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: {
//     rejectUnauthorized: false, // required for Render's PostgreSQL
//   },
// });

// export default pool;
// import { Sequelize } from "sequelize";
// import dotenv from "dotenv";

// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT, 10) || 5432,  // change to 3306 for MySQL
//     dialect: "postgres",  // change to "mysql" for MySQL
//     pool: {
//       max: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//     logging: process.env.NODE_ENV === "development" ? console.log : false,
//   }
// );

// export default sequelize;

import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    dialectOptions: {  // 👈 Critical for Render
      ssl: {
        require: true,  // 👈 Enforces SSL
        rejectUnauthorized: false  // 👈 Necessary for Render's PostgreSQL
      }
    },
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: console.log  // 👈 Keep logging enabled for debugging
  }
);

// Test connection immediately
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    const [result] = await sequelize.query('SELECT NOW()');
    console.log('Database time:', result[0].now);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;