import dotenv from "dotenv";
import type { Knex } from "knex";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", "..", ".env"),
});

const normalConfig: Knex.Config = {
  client: "postgresql",
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    timezone: process.env.TZ,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: path.resolve(__dirname, "migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "seeds", "prod"),
  },
};

const testConfig: Knex.Config = {
  client: "postgresql",
  connection: {
    host: process.env.POSTGRES_HOST_TEST,
    user: process.env.POSTGRES_USER_TEST,
    password: process.env.POSTGRES_PASSWORD_TEST,
    port: Number(process.env.POSTGRES_PORT_TEST),
    database: process.env.POSTGRES_DB_TEST,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: path.resolve(__dirname, "migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "seeds", "test"),
  },
};

const config: { [key: string]: Knex.Config } = {
  test: testConfig,
  development: normalConfig,
  staging: normalConfig,
  production: normalConfig,
};

export default config;
