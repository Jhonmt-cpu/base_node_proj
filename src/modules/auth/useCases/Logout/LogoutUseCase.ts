import { ILogoutDTO } from "@modules/auth/@types/ILogoutDTO";
import { IRefreshTokenRepository } from "@modules/auth/repositories/IRefreshTokenRepository";
import { inject, injectable } from "tsyringe";

@injectable()
class LogoutUseCase {
  constructor(
    @inject("RefreshTokenRepository")
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute({ user_id }: ILogoutDTO) {
    await this.refreshTokenRepository.deleteAllByUserId(user_id);
  }
}

export { LogoutUseCase };
