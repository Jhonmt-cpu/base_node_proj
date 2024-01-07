import { Request, Response, NextFunction } from "express";

import { AppError } from "@shared/errors/AppError";

function checkRole(allowedRoles: string[]) {
  return function (request: Request, response: Response, next: NextFunction) {
    if (!request.user) {
      throw new AppError("Access Denied: You must be logged in", 401);
    }

    if (!allowedRoles.includes(request.user.user_role)) {
      throw new AppError(
        "Access Denied: You do not have permission to perform this action",
        403,
      );
    }

    return next();
  };
}

export { checkRole };
