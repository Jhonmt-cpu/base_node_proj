import { inject, injectable } from "tsyringe";

import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";
import { ICityRepository } from "@modules/users/repositories/ICityRepository";
import { IStateRepository } from "@modules/users/repositories/IStateRepository";
import { IFindCitiesByStateDTO } from "@modules/users/@types/IFindCitiesByStateDTO";

import { AppError } from "@shared/errors/AppError";

@injectable()
class ListCitiesByStateUseCase {
  constructor(
    @inject("StateRepository")
    private stateRepository: IStateRepository,
    @inject("CityRepository")
    private cityRepository: ICityRepository,
  ) {}

  async execute({ state_id }: IFindCitiesByStateDTO): Promise<CityEntity[]> {
    if (state_id <= 0) {
      throw new AppError("Invalid state");
    }

    const state = await this.stateRepository.findById(state_id);

    if (!state) {
      throw new AppError("State not found", 404);
    }

    const cities = await this.cityRepository.findByState({ state_id });

    return cities;
  }
}

export { ListCitiesByStateUseCase };
