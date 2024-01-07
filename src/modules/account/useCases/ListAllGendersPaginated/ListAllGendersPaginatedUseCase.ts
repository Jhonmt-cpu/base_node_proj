import { inject, injectable } from "tsyringe";

import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";

@injectable()
class ListAllGendersPaginatedUseCase {
  constructor(
    @inject("GenderRepository")
    private gendersRepository: IGenderRepository,
  ) {}

  async execute({ page, limit }: IFindAllPaginatedDTO) {
    const genders = await this.gendersRepository.findAllPaginated({
      page,
      limit,
    });

    return genders;
  }
}

export { ListAllGendersPaginatedUseCase };
