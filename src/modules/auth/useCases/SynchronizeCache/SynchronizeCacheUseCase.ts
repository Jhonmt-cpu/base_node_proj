import { inject, injectable } from "tsyringe";

import { IRefreshTokenRepository } from "@modules/auth/repositories/IRefreshTokenRepository";

import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";

import auth from "@config/auth";

@injectable()
class SynchronizeCacheUseCase {
  constructor(
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("RefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute() {
    await this.refreshTokenRepository.deleteExpiredTokens();

    const refreshTokens =
      await this.refreshTokenRepository.findAllWithUserAndRole();

    const refreshTokensToCache = refreshTokens.map((refreshToken) => {
      return {
        key: `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
        value: JSON.stringify({
          user_id: refreshToken.user_id,
          user_name: refreshToken.user_name,
          user_role: refreshToken.role_name,
        }),
        expiresInSeconds: this.dateProvider.getDifferenceInSeconds({
          start_date: this.dateProvider.dateNow(),
          end_date: refreshToken.refresh_token_expires_in,
        }),
      };
    });

    await this.cacheProvider.cacheFlushAll();

    await this.cacheProvider.cacheMultipleSet(refreshTokensToCache);
  }
}

export { SynchronizeCacheUseCase };
