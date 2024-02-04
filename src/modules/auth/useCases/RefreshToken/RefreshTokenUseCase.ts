import { inject, injectable } from "tsyringe";

import { IRefreshTokenDTO } from "@modules/auth/@types/IRefreshTokenDTO";
import { IGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/IGenerateTokenProvider";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IRefreshTokenRepository } from "@modules/auth/repositories/IRefreshTokenRepository";

import auth from "@config/auth";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class RefreshTokenUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("GenerateTokenProvider")
    private generateTokenProvider: IGenerateTokenProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("RefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ refresh_token }: IRefreshTokenDTO) {
    const tokenCache = await this.cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refresh_token}`,
    );

    if (!tokenCache) {
      throw new AppError(AppErrorMessages.REFRESH_TOKEN_NOT_FOUND, 404);
    }

    const { user_id, user_name, user_role } = JSON.parse(tokenCache);

    await this.cacheProvider.cacheDel(
      `${auth.refresh.cachePrefix}:${refresh_token}`,
    );

    const rowsDeleted = await this.refreshTokenRepository.deleteById(
      refresh_token,
    );

    if (rowsDeleted === 0) {
      throw new AppError(AppErrorMessages.REFRESH_TOKEN_INVALID, 400);
    }

    const newRefreshToken = await this.refreshTokenRepository.create({
      refresh_token_user_id: user_id,
      refresh_token_expires_in: this.dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    await this.cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${newRefreshToken.refresh_token_id}`,
      value: JSON.stringify({
        user_id,
        user_name,
        user_role,
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    const token = await this.generateTokenProvider.generateToken({
      user_id,
      user_name,
      user_role,
    });

    return { token, refresh_token: newRefreshToken.refresh_token_id };
  }
}

export { RefreshTokenUseCase };
