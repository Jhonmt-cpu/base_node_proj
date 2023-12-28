import { dbConnection } from "@shared/infra/database/knex";

import {
  ICityRepository,
  ICreateCityRepositoryDTO,
  IFindByNameAndStateRepositoryDTO,
  IFindCitiesByStateRepositoryDTO,
} from "@modules/users/repositories/ICityRepository";

import { CityEntity } from "../entities/CityEntity";
class CityRepository implements ICityRepository {
  async create(data: ICreateCityRepositoryDTO): Promise<CityEntity> {
    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: data.city_name,
        city_state_id: data.city_state_id,
      })
      .returning("*");

    return city[0];
  }

  async findByState({
    state_id,
  }: IFindCitiesByStateRepositoryDTO): Promise<CityEntity[]> {
    const cities = await dbConnection<CityEntity>("tb_cities")
      .select("*")
      .where({
        city_state_id: state_id,
      });

    return cities;
  }

  async findById(id: number): Promise<CityEntity | undefined> {
    const city = await dbConnection<CityEntity>("tb_cities")
      .select("*")
      .where({
        city_id: id,
      })
      .first();

    return city;
  }

  async findByNameAndState(
    data: IFindByNameAndStateRepositoryDTO,
  ): Promise<CityEntity | undefined> {
    const city = await dbConnection<CityEntity>("tb_cities")
      .select("*")
      .where({
        city_name: data.city_name,
        city_state_id: data.city_state_id,
      })
      .first();

    return city;
  }
}

export { CityRepository };
