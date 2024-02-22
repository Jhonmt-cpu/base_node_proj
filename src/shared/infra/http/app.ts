import express, { NextFunction, Request, Response } from "express";
import { errors } from "celebrate";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import fs from "fs";

import "@shared/container";

import { AppError } from "@errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import rateLimiter from "./middlewares/rateLimiter";

import { router } from "./routes";

const app = express();

const file = fs.readFileSync("docs/doc.yml", "utf8");

const specs = yaml.parse(file);

app.use(express.json());

app.use(rateLimiter);

app.use(router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(errors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.log(err);

  return response.status(500).json({
    status: AppErrorMessages.ERROR,
    message: AppErrorMessages.INTERNAL_SERVER_ERROR,
  });
});

export { app };
