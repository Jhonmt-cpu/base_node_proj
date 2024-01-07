import { inject, injectable } from "tsyringe";

import { IRefreshTokenDTO } from "@modules/auth/@types/IRefreshTokenDTO";
import { IGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/IGenerateTokenProvider";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

import auth from "@config/auth";

import { AppError } from "@shared/errors/AppError";

@injectable()
class RefreshTokenUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("GenerateTokenProvider")
    private generateTokenProvider: IGenerateTokenProvider,
  ) {}

  async execute({ refresh_token }: IRefreshTokenDTO) {
    const tokenCache = await this.cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refresh_token}`,
    );

    if (!tokenCache) {
      throw new AppError("Refresh token not found", 404);
    }

    const { user_id, user_name, user_role } = JSON.parse(tokenCache);

    const token = await this.generateTokenProvider.generateToken({
      user_id,
      user_name,
      user_role,
    });

    return { token };
  }
}

export { RefreshTokenUseCase };
