import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";
import { IStateRepository } from "@modules/account/repositories/IStateRepository";
import { IFindCitiesByStateDTO } from "@modules/account/@types/IFindCitiesByStateDTO";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListCitiesByStateUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("StateRepository")
    private stateRepository: IStateRepository,
    @inject("CityRepository")
    private cityRepository: ICityRepository,
  ) {}

  async execute({ state_id }: IFindCitiesByStateDTO): Promise<CityEntity[]> {
    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state_id}`;

    const cachedCities = await this.cacheProvider.cacheGet(cacheKey);

    if (cachedCities) {
      return JSON.parse(cachedCities);
    }

    const state = await this.stateRepository.findById(state_id);

    if (!state) {
      throw new AppError(AppErrorMessages.STATE_NOT_FOUND, 404);
    }

    const cities = await this.cityRepository.findByState({ state_id });

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(cities),
      expiresInSeconds: 60 * 60 * 24,
    });

    return cities;
  }
}

export { ListCitiesByStateUseCase };
