import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";

import { IFindCitiesByStateDTO } from "@modules/users/@types/IFindCitiesByStateDTO";
import { ICreateCityDTO } from "@modules/users/@types/ICreateCityDTO";

import { ICityRepository } from "../ICityRepository";
class CityRepositoryInMemory implements ICityRepository {
  private cities: CityEntity[] = [];

  async create(data: ICreateCityDTO): Promise<CityEntity> {
    const city = new CityEntity({
      city_id: this.cities.length + 1,
      city_name: data.city_name,
      city_state_id: data.city_state_id,
      city_created_at: new Date(),
    });

    this.cities.push(city);

    return city;
  }

  async findByState({
    state_id,
  }: IFindCitiesByStateDTO): Promise<CityEntity[]> {
    const cities = this.cities.filter(
      (city) => city.city_state_id === state_id,
    );

    return cities;
  }

  async findById(id: number): Promise<CityEntity | undefined> {
    const city = this.cities.find((city) => city.city_id === id);

    return city;
  }
}

export { CityRepositoryInMemory };
