import express, { NextFunction, Request, Response } from 'express';
import { router } from './routes';
import { errors } from 'celebrate';

import '../../container';
import { AppError } from '../../errors/AppError';

const app = express();

app.use(express.json());

app.use(router);

app.use(errors());

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.log(err);

  return response.status(500).json({
    status: 'error',
    message: `Internal server error - ${err.message}`,
  });
});

export { app };