import { inject, injectable } from "tsyringe";

import { IRefreshTokenDTO } from "@modules/auth/@types/IRefreshTokenDTO";
import { IGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/IGenerateTokenProvider";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IRefreshTokenRepository } from "@modules/auth/repositories/IRefreshTokenRepository";

import auth from "@config/auth";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";

@injectable()
class RefreshTokenUseCase {
  constructor(
    @inject("GenerateTokenProvider")
    private generateTokenProvider: IGenerateTokenProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("RefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ refresh_token }: IRefreshTokenDTO) {
    const tokenExists = await this.refreshTokenRepository.findById(
      refresh_token,
    );

    if (!tokenExists) {
      throw new AppError(AppErrorMessages.REFRESH_TOKEN_INVALID, 400);
    }

    const userWithRole = await this.userRepository.findByIdWithRole(
      tokenExists.refresh_token_user_id,
    );

    if (!userWithRole) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    await this.refreshTokenRepository.deleteById(tokenExists.refresh_token_id);

    const newRefreshToken = await this.refreshTokenRepository.create({
      refresh_token_user_id: userWithRole.user_id,
      refresh_token_expires_in: this.dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    const token = await this.generateTokenProvider.generateToken({
      user_id: userWithRole.user_id,
      user_name: userWithRole.user_name,
      user_role: userWithRole.role_name,
    });

    return { token, refresh_token: newRefreshToken.refresh_token_id };
  }
}

export { RefreshTokenUseCase };
