import { inject, injectable } from "tsyringe";

import { IFindUserCompleteByIdDTO } from "@modules/account/@types/IFindUserCompleteByIdDTO";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { flatUserCompleteToUserWithoutPassword } from "@modules/account/mappers/flatUserCompleteToUserWithoutPassword";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class GetUserCompleteUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IFindUserCompleteByIdDTO) {
    const user = await this.userRepository.findByIdCompleteRelations(user_id);

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    const userWithoutPassword = flatUserCompleteToUserWithoutPassword(user);

    return userWithoutPassword;
  }
}

export { GetUserCompleteUseCase };
