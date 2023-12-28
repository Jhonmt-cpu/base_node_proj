import { inject, injectable } from "tsyringe";

import { IDeleteUserDTO } from "@modules/users/@types/IDeleteUserDTO";
import { IUserRepository } from "@modules/users/repositories/IUserRepository";

import { AppError } from "@shared/errors/AppError";

@injectable()
class DeleteUserUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IDeleteUserDTO): Promise<void> {
    const user = await this.userRepository.findByIdWithoutPassword(user_id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await this.userRepository.deleteById(user_id);
  }
}

export { DeleteUserUseCase };
