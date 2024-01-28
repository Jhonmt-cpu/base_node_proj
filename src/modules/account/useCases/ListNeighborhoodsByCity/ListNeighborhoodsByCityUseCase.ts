import { inject, injectable } from "tsyringe";

import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";
import { IFindNeighborhoodsByCityDTO } from "@modules/account/@types/IFindNeighborhoodsByCityDTO";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class ListNeighborhoodsByCityUseCase {
  constructor(
    @inject("CityRepository")
    private cityRepository: ICityRepository,

    @inject("NeighborhoodRepository")
    private neighborhoodRepository: INeighborhoodRepository,
  ) {}

  async execute({
    city_id,
  }: IFindNeighborhoodsByCityDTO): Promise<NeighborhoodEntity[]> {
    const cityExists = await this.cityRepository.findById(city_id);

    if (!cityExists) {
      throw new AppError(AppErrorMessages.CITY_NOT_FOUND, 404);
    }

    const neighborhoods = await this.neighborhoodRepository.findByCityId(
      city_id,
    );

    return neighborhoods;
  }
}

export { ListNeighborhoodsByCityUseCase };
