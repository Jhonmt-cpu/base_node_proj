import { inject, injectable } from "tsyringe";

import { ICreateCityDTO } from "@modules/account/@types/ICreateCityDTO";
import { ICityRepository } from "@modules/account/repositories/ICityRepository";

import { AppError } from "@shared/errors/AppError";
import { IStateRepository } from "@modules/account/repositories/IStateRepository";

@injectable()
class CreateCityUseCase {
  constructor(
    @inject("StateRepository")
    private stateRepository: IStateRepository,

    @inject("CityRepository")
    private cityRepository: ICityRepository,
  ) {}

  async execute({ city_name, city_state_id }: ICreateCityDTO) {
    const stateExists = await this.stateRepository.findById(city_state_id);

    if (!stateExists) {
      throw new AppError("State not found!", 404);
    }

    const cityAlreadyExists = await this.cityRepository.findByNameAndState({
      city_name,
      city_state_id,
    });

    if (cityAlreadyExists) {
      throw new AppError("City already exists!");
    }

    const city = await this.cityRepository.create({
      city_name,
      city_state_id,
    });

    return city;
  }
}

export { CreateCityUseCase };
