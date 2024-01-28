import { inject, injectable } from "tsyringe";

import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { IFindUserByIdDTO } from "@modules/account/@types/IFindUserByIdDTO";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class GetUserUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IFindUserByIdDTO) {
    const user = await this.userRepository.findByIdWithoutPassword(user_id);

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    return user;
  }
}

export { GetUserUseCase };
