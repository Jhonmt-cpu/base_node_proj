import { inject, injectable } from "tsyringe";

import { IUserRepository } from "@modules/users/repositories/IUserRepository";
import { IFindUserByIdDTO } from "@modules/users/@types/IFindUserByIdDTO";
import { AppError } from "@shared/errors/AppError";

@injectable()
class GetUserUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IFindUserByIdDTO) {
    const user = await this.userRepository.findByIdWithoutPassword(user_id);

    if (!user) {
      throw new AppError("User not found!", 404);
    }

    return user;
  }
}

export { GetUserUseCase };
