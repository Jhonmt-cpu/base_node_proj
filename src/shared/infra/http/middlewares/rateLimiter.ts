import { Request, Response, NextFunction } from "express";

import { cachePrefixes } from "@config/cache";

import {
  redisRateLimiterGet,
  redisRateLimiterSet,
} from "@utils/redisRateLimiter";

import { AppErrorMessages } from "@errors/AppErrorMessages";
import { AppError } from "@errors/AppError";

export default async function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { ip } = request;

    const key = `${cachePrefixes.rateLimiter}:${ip}`;

    const currentRequests = Number((await redisRateLimiterGet(key)) || 0) + 1;

    await redisRateLimiterSet({
      key,
      value: currentRequests.toString(),
      expiresInSeconds: 30,
    });

    const maxRequestsPerMinute = process.env.NODE_ENV === "test" ? 999999 : 20;

    if (currentRequests > maxRequestsPerMinute) {
      throw new AppError(AppErrorMessages.TOO_MANY_REQUESTS, 429);
    }

    return next();
  } catch (e) {
    if (e instanceof AppError) {
      throw e;
    }

    throw new AppError(AppErrorMessages.TOO_MANY_REQUESTS_TRY_AGAIN_LATER, 429);
  }
}
