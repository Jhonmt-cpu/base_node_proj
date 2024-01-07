import { inject, injectable } from "tsyringe";

import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";
import { IFindNeighborhoodsByCityDTO } from "@modules/account/@types/IFindNeighborhoodsByCityDTO";

import { AppError } from "@shared/errors/AppError";

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
    if (city_id <= 0) {
      throw new AppError("Invalid city!");
    }

    const cityExists = await this.cityRepository.findById(city_id);

    if (!cityExists) {
      throw new AppError("City does not exists!", 404);
    }

    const neighborhoods = await this.neighborhoodRepository.findByCityId(
      city_id,
    );

    return neighborhoods;
  }
}

export { ListNeighborhoodsByCityUseCase };
