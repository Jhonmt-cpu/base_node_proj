import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";

import {
  ICityRepository,
  ICreateCityRepositoryDTO,
  IFindByNameAndStateRepositoryDTO,
  IFindCitiesByStateRepositoryDTO,
} from "../ICityRepository";

import { DatabaseInMemory } from "./DatabaseInMemory";
class CityRepositoryInMemory implements ICityRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(data: ICreateCityRepositoryDTO): Promise<CityEntity> {
    const city = new CityEntity({
      city_id: this.databaseInMemory.cities.length + 1,
      city_name: data.city_name,
      city_state_id: data.city_state_id,
      city_created_at: new Date(),
    });

    this.databaseInMemory.cities.push(city);

    return city;
  }

  async findByState({
    state_id,
  }: IFindCitiesByStateRepositoryDTO): Promise<CityEntity[]> {
    const cities = this.databaseInMemory.cities.filter(
      (city) => city.city_state_id === state_id,
    );

    return cities;
  }

  async findById(id: number): Promise<CityEntity | undefined> {
    const city = this.databaseInMemory.cities.find(
      (city) => city.city_id === id,
    );

    return city;
  }

  async findByNameAndState(
    data: IFindByNameAndStateRepositoryDTO,
  ): Promise<CityEntity | undefined> {
    const city = this.databaseInMemory.cities.find(
      (city) =>
        city.city_name === data.city_name &&
        city.city_state_id === data.city_state_id,
    );

    return city;
  }
}

export { CityRepositoryInMemory };
