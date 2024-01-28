import { inject, injectable } from "tsyringe";

import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";
import { IStateRepository } from "@modules/account/repositories/IStateRepository";
import { IFindCitiesByStateDTO } from "@modules/account/@types/IFindCitiesByStateDTO";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class ListCitiesByStateUseCase {
  constructor(
    @inject("StateRepository")
    private stateRepository: IStateRepository,
    @inject("CityRepository")
    private cityRepository: ICityRepository,
  ) {}

  async execute({ state_id }: IFindCitiesByStateDTO): Promise<CityEntity[]> {
    const state = await this.stateRepository.findById(state_id);

    if (!state) {
      throw new AppError(AppErrorMessages.STATE_NOT_FOUND, 404);
    }

    const cities = await this.cityRepository.findByState({ state_id });

    return cities;
  }
}

export { ListCitiesByStateUseCase };
