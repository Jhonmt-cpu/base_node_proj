import * as jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { IEncryptAndDecryptProvider } from "@modules/auth/container/providers/EncryptAndDecryptProvider/IEncryptAndDecryptProvider";
import { CryptoEncryptAndDecryptProvider } from "@modules/auth/container/providers/EncryptAndDecryptProvider/implementations/CryptoEncryptAndDecryptProvider";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import auth from "@config/auth";

declare module "jsonwebtoken" {
  export interface UserJwtPayload extends JwtPayload {
    user_id: number;
    user_name: string;
  }
}

class EnsureAuthenticated {
  private static encryptAndDecryptProvider: IEncryptAndDecryptProvider;

  constructor() {
    if (!EnsureAuthenticated.encryptAndDecryptProvider) {
      EnsureAuthenticated.encryptAndDecryptProvider =
        new CryptoEncryptAndDecryptProvider();
    }
  }

  public async execute(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const authToken = request.headers.authorization;

    if (!authToken) {
      throw new AppError(AppErrorMessages.TOKEN_MISSING, 401);
    }

    const [, token] = authToken.split(" ");

    try {
      const tokenVerified = <jwt.UserJwtPayload>(
        jwt.verify(token, auth.jwt.jwtSecret)
      );
      const tokenDecoded =
        await EnsureAuthenticated.encryptAndDecryptProvider.decrypt(
          tokenVerified.sub as string,
        );

      const { user_role } = JSON.parse(tokenDecoded);

      request.user = {
        user_id: tokenVerified.user_id,
        user_name: tokenVerified.user_name,
        user_role,
      };

      return next();
    } catch (e) {
      if (e instanceof AppError) {
        throw e;
      }

      console.log(e);

      throw new AppError(AppErrorMessages.INVALID_TOKEN, 401);
    }
  }
}

export { EnsureAuthenticated };
