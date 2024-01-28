import { inject, injectable } from "tsyringe";

import { IDeleteUserDTO } from "@modules/account/@types/IDeleteUserDTO";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { IRefreshTokenRepository } from "@modules/auth/repositories/IRefreshTokenRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

import auth from "@config/auth";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";

@injectable()
class DeleteUserUseCase {
  constructor(
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("RefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({
    user_id,
    user_password,
    is_admin_request,
  }: IDeleteUserDTO): Promise<void> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    if (!is_admin_request) {
      const passwordMatch = await this.hashProvider.compareHash(
        user_password,
        user.user_password,
      );

      if (!passwordMatch) {
        throw new AppError(AppErrorMessages.USER_INCORRECT_PASSWORD, 401);
      }
    }

    const refreshTokensRepository =
      await this.refreshTokenRepository.findAllByUserId(user.user_id);

    for await (const refreshToken of refreshTokensRepository) {
      await this.cacheProvider.cacheDel(
        `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
      );
    }

    await this.userRepository.deleteById(user_id);
  }
}

export { DeleteUserUseCase };
