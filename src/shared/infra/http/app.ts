import express, { NextFunction, Request, Response } from "express";
import { errors } from "celebrate";

import { AppError } from "@errors/AppError";

import { router } from "./routes";

import "@shared/container";

const app = express();

app.use(express.json());

app.use(router);

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
    status: "error",
    message: `Internal server error - ${err.message}`,
  });
});

export { app };
