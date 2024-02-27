import { inject, injectable } from "tsyringe";

import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { IResetPasswordDTO } from "@modules/auth/@types/IResetPasswordDTO";
import { IResetTokenRepository } from "@modules/auth/repositories/IResetTokenRepository";

import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class ResetPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("ResetTokenRepository")
    private resetTokenRepository: IResetTokenRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
  ) {}

  async execute({
    reset_token,
    new_password,
  }: IResetPasswordDTO): Promise<void> {
    const tokenExists = await this.resetTokenRepository.findById(reset_token);

    if (!tokenExists) {
      throw new AppError(AppErrorMessages.RESET_TOKEN_INVALID);
    }

    const tokenExpired = this.dateProvider.isBeforeNow(
      tokenExists.reset_token_expires_in,
    );

    if (tokenExpired) {
      throw new AppError(AppErrorMessages.RESET_TOKEN_EXPIRED);
    }

    const user = await this.userRepository.findById(
      tokenExists.reset_token_user_id,
    );

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    const newPasswordHash = await this.hashProvider.generateHash(new_password);

    await this.userRepository.update({
      user_id: user.user_id,
      updateFields: {
        user_password: newPasswordHash,
      },
    });

    await this.resetTokenRepository.deleteById(tokenExists.reset_token_id);
  }
}

export { ResetPasswordUseCase };
