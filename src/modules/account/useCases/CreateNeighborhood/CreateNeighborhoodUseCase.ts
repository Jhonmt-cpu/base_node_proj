import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { ICreateNeighborhoodDTO } from "@modules/account/@types/ICreateNeighborhoodDTO";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class CreateNeighborhoodUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("CityRepository")
    private cityRepository: ICityRepository,
    @inject("NeighborhoodRepository")
    private neighborhoodRepository: INeighborhoodRepository,
  ) {}

  async execute({
    neighborhood_city_id,
    neighborhood_name,
  }: ICreateNeighborhoodDTO) {
    const cityExists = await this.cityRepository.findById(neighborhood_city_id);

    if (!cityExists) {
      throw new AppError(AppErrorMessages.CITY_NOT_FOUND, 404);
    }

    const neighborhoodAlreadyExists =
      await this.neighborhoodRepository.findByNameAndCity({
        neighborhood_city_id,
        neighborhood_name,
      });

    if (neighborhoodAlreadyExists) {
      throw new AppError(AppErrorMessages.NEIGHBORHOOD_ALREADY_EXISTS);
    }

    const neighborhood = await this.neighborhoodRepository.create({
      neighborhood_city_id,
      neighborhood_name,
    });

    const cacheKey = `${cachePrefixes.listNeighborhoodsByCity}:city_id:${neighborhood_city_id}`;

    await this.cacheProvider.cacheDel(cacheKey);

    return neighborhood;
  }
}

export { CreateNeighborhoodUseCase };
