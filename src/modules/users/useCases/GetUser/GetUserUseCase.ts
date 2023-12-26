import { inject, injectable } from "tsyringe";

import { IUserRepository } from "@modules/users/repositories/IUserRepository";
import { IFindUserByIdDTO } from "@modules/users/@types/IFindUserByIdDTO";
import { AppError } from "@shared/errors/AppError";
import { userToUserWithoutPassword } from "@modules/users/mappers/userToUserWithoutPassword";

@injectable()
class GetUserUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IFindUserByIdDTO) {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new AppError("User not found!", 404);
    }

    const userWithoutPassword = userToUserWithoutPassword(user);

    return userWithoutPassword;
  }
}

export { GetUserUseCase };
