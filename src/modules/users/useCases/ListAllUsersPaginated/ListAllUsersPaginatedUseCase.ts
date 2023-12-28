import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { IUserRepository } from "@modules/users/repositories/IUserRepository";
import { inject, injectable } from "tsyringe";

@injectable()
class ListAllUsersPaginatedUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ page, limit }: IFindAllPaginatedDTO) {
    const users = await this.userRepository.findAllPaginated({ page, limit });

    return users;
  }
}

export { ListAllUsersPaginatedUseCase };
