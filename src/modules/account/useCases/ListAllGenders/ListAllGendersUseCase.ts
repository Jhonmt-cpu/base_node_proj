import { inject, injectable } from "tsyringe";

import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";

@injectable()
class ListAllGendersUseCase {
  constructor(
    @inject("GenderRepository")
    private gendersRepository: IGenderRepository,
  ) {}

  async execute() {
    const genders = await this.gendersRepository.findAll();

    return genders;
  }
}

export { ListAllGendersUseCase };
