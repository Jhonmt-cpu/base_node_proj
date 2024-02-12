import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { ICreateCityDTO } from "@modules/account/@types/ICreateCityDTO";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { AppError } from "@shared/errors/AppError";

import { IStateRepository } from "@modules/account/repositories/IStateRepository";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class CreateCityUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("StateRepository")
    private stateRepository: IStateRepository,
    @inject("CityRepository")
    private cityRepository: ICityRepository,
  ) {}

  async execute({ city_name, city_state_id }: ICreateCityDTO) {
    const stateExists = await this.stateRepository.findById(city_state_id);

    if (!stateExists) {
      throw new AppError(AppErrorMessages.STATE_NOT_FOUND, 404);
    }

    const cityAlreadyExists = await this.cityRepository.findByNameAndState({
      city_name,
      city_state_id,
    });

    if (cityAlreadyExists) {
      throw new AppError(AppErrorMessages.CITY_ALREADY_EXISTS);
    }

    const city = await this.cityRepository.create({
      city_name,
      city_state_id,
    });

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${city_state_id}`;

    await this.cacheProvider.cacheDel(cacheKey);

    return city;
  }
}

export { CreateCityUseCase };
