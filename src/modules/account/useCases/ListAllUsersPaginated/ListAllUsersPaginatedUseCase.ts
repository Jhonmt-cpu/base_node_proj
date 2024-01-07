import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";
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
