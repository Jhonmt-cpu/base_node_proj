import knex from "knex";

import config from "./knexfile";

const dbConnection = knex(config[process.env.NODE_ENV || "development"]);

dbConnection
  .raw("SELECT 1")
  .then(() => console.log("Database connection successful"))
  .catch((error) => console.error("Database connection error:", error));

export { dbConnection };
