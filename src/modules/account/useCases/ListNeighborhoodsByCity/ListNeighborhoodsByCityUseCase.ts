import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";
import { IFindNeighborhoodsByCityDTO } from "@modules/account/@types/IFindNeighborhoodsByCityDTO";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListNeighborhoodsByCityUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("CityRepository")
    private cityRepository: ICityRepository,
    @inject("NeighborhoodRepository")
    private neighborhoodRepository: INeighborhoodRepository,
  ) {}

  async execute({
    city_id,
  }: IFindNeighborhoodsByCityDTO): Promise<NeighborhoodEntity[]> {
    const cacheKey = `${cachePrefixes.listNeighborhoodsByCity}:city_id:${city_id}`;

    const cachedNeighborhoods = await this.cacheProvider.cacheGet(cacheKey);

    if (cachedNeighborhoods) {
      return JSON.parse(cachedNeighborhoods);
    }

    const cityExists = await this.cityRepository.findById(city_id);

    if (!cityExists) {
      throw new AppError(AppErrorMessages.CITY_NOT_FOUND, 404);
    }

    const neighborhoods = await this.neighborhoodRepository.findByCityId(
      city_id,
    );

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(neighborhoods),
      expiresInSeconds: 60 * 60 * 24,
    });

    return neighborhoods;
  }
}

export { ListNeighborhoodsByCityUseCase };
