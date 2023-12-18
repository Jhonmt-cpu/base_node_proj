import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";

import { ICityRepository, ICreateCityDTO } from "../ICityRepository";

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
}

export { CityRepositoryInMemory };
