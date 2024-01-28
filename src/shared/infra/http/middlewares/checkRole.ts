import { Request, Response, NextFunction } from "express";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { AppError } from "@shared/errors/AppError";

function checkRole(allowedRoles: string[]) {
  return function (request: Request, response: Response, next: NextFunction) {
    if (!request.user) {
      throw new AppError(AppErrorMessages.ACCESS_DENIED_NOT_LOGGED, 401);
    }

    if (!allowedRoles.includes(request.user.user_role)) {
      throw new AppError(AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION, 403);
    }

    return next();
  };
}

export { checkRole };
