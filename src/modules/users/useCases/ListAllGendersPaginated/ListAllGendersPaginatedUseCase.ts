import { inject, injectable } from "tsyringe";

import { IGenderRepository } from "@modules/users/repositories/IGenderRepository";
import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";

@injectable()
class ListAllGendersPaginatedUseCase {
  constructor(
    @inject("GenderRepository")
    private gendersRepository: IGenderRepository,
  ) {}

  async execute({ page, limit }: IFindAllPaginatedDTO) {
    if (page <= 0 || limit <= 0) {
      page = 1;
      limit = 20;
    }

    const genders = await this.gendersRepository.findAllPaginated({
      page,
      limit,
    });

    return genders;
  }
}

export { ListAllGendersPaginatedUseCase };
