import knex from "knex";

const dbConnection = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    timezone: process.env.TZ,
  },
});

export { dbConnection };
