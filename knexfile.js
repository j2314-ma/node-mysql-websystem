require('dotenv').config();

const baseConfig = {
  client: "mysql",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "todo_app",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    charset: "utf8mb4",
    collation: "utf8mb4_unicode_ci",
  },
  pool: {
    min: 2,
    max: 10
  },
};

module.exports = {
  development: baseConfig,
  staging: baseConfig,
  production: baseConfig,
};
