import { inject, injectable } from "tsyringe";

import { ICreateNeighborhoodDTO } from "@modules/users/@types/ICreateNeighborhoodDTO";
import { ICityRepository } from "@modules/users/repositories/ICityRepository";
import { INeighborhoodRepository } from "@modules/users/repositories/INeighborhoodRepository";

import { AppError } from "@shared/errors/AppError";

@injectable()
class CreateNeighborhoodUseCase {
  constructor(
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
      throw new AppError("City not found!");
    }

    const neighborhoodAlreadyExists =
      await this.neighborhoodRepository.findByNameAndCity({
        neighborhood_city_id,
        neighborhood_name,
      });

    if (neighborhoodAlreadyExists) {
      throw new AppError("Neighborhood already exists!");
    }

    const neighborhood = await this.neighborhoodRepository.create({
      neighborhood_city_id,
      neighborhood_name,
    });

    return neighborhood;
  }
}

export { CreateNeighborhoodUseCase };
