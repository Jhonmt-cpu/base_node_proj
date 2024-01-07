import { inject, injectable } from "tsyringe";

import auth from "@config/auth";

import { ILoginDTO } from "@modules/auth/@types/ILoginDTO";
import { IGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/IGenerateTokenProvider";
import { IRefreshTokenRepository } from "@modules/auth/repositories/IRefreshTokenRepository";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";

import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";

import { AppError } from "@shared/errors/AppError";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class LoginUseCase {
  constructor(
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("GenerateTokenProvider")
    private generateTokenProvider: IGenerateTokenProvider,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("RefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ user_email, user_password }: ILoginDTO) {
    const user = await this.userRepository.findByEmailWithRole(user_email);

    if (!user) {
      throw new AppError("Incorrect email or password");
    }

    const passwordMatch = await this.hashProvider.compareHash(
      user_password,
      user.user_password,
    );

    if (!passwordMatch) {
      throw new AppError("Incorrect email or password");
    }

    const token = await this.generateTokenProvider.generateToken({
      user_id: user.user_id,
      user_name: user.user_name,
      user_role: user.role_name,
    });

    const refreshTokensRepository =
      await this.refreshTokenRepository.findAllByUserId(user.user_id);

    for await (const refreshToken of refreshTokensRepository) {
      await this.cacheProvider.cacheDel(
        `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
      );
    }

    await this.refreshTokenRepository.deleteAllByUserId(user.user_id);

    const refreshTokenExpiresIn = this.dateProvider.addDays(
      Number(auth.refresh.expiresInDays),
    );

    const refreshToken = await this.refreshTokenRepository.create({
      refresh_token_user_id: user.user_id,
      refresh_token_expires_in: refreshTokenExpiresIn,
    });

    await this.cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify({
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: user.role_name,
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    return {
      token,
      refresh_token: refreshToken.refresh_token_id,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
      },
    };
  }
}

export { LoginUseCase };
