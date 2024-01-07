import { sign } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import auth from "@config/auth";

import {
  IGenerateToken,
  IGenerateTokenProvider,
} from "../IGenerateTokenProvider";
import { IEncryptAndDecryptProvider } from "../../EncryptAndDecryptProvider/IEncryptAndDecryptProvider";

@injectable()
class JWTGenerateTokenProvider implements IGenerateTokenProvider {
  constructor(
    @inject("EncryptAndDecryptProvider")
    private encryptAndDecryptProvider: IEncryptAndDecryptProvider,
  ) {}

  async generateToken({
    user_id,
    user_name,
    user_role,
  }: IGenerateToken): Promise<string> {
    const subject = await this.encryptAndDecryptProvider.encrypt(
      JSON.stringify({ user_role }),
    );

    const token = sign(
      {
        user_id,
        user_name,
      },
      auth.jwt.jwtSecret,
      {
        subject: subject,
        expiresIn: auth.jwt.expiresIn,
      },
    );

    return token;
  }
}

export { JWTGenerateTokenProvider };
