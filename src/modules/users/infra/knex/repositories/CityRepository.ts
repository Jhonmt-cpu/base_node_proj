import { ICityRepository } from "@modules/users/repositories/ICityRepository";

import { IFindCitiesByStateDTO } from "@modules/users/@types/IFindCitiesByStateDTO";
import { ICreateCityDTO } from "@modules/users/@types/ICreateCityDTO";

import { CityEntity } from "../entities/CityEntity";
import { dbConnection } from "@shared/infra/database/knex";
class CityRepository implements ICityRepository {
  async create(data: ICreateCityDTO): Promise<CityEntity> {
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
  }: IFindCitiesByStateDTO): Promise<CityEntity[]> {
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
}

export { CityRepository };
