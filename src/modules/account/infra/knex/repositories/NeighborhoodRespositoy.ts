import { dbConnection } from "@shared/infra/database/knex";

import {
  INeighborhoodRepository,
  ICreateNeighborhoodRepositoryDTO,
  IFindNeighborhoodByNameAndCityRepositoryDTO,
} from "@modules/account/repositories/INeighborhoodRepository";

import { NeighborhoodEntity } from "../entities/NeighborhoodEntity";

class NeighborhoodRepository implements INeighborhoodRepository {
  async create(
    data: ICreateNeighborhoodRepositoryDTO,
  ): Promise<NeighborhoodEntity> {
    const neighborhood = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .insert({
        neighborhood_name: data.neighborhood_name,
        neighborhood_city_id: data.neighborhood_city_id,
      })
      .returning("*");

    return neighborhood[0];
  }

  async findByCityId(city_id: number): Promise<NeighborhoodEntity[]> {
    const neighborhoods = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .select("*")
      .where({
        neighborhood_city_id: city_id,
      });

    return neighborhoods;
  }

  async findById(
    neighborhood_id: number,
  ): Promise<NeighborhoodEntity | undefined> {
    const neighborhood = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .select("*")
      .where({
        neighborhood_id,
      })
      .first();

    return neighborhood;
  }

  findByNameAndCity({
    neighborhood_city_id,
    neighborhood_name,
  }: IFindNeighborhoodByNameAndCityRepositoryDTO): Promise<
    NeighborhoodEntity | undefined
  > {
    const neighborhood = dbConnection<NeighborhoodEntity>("tb_neighborhoods")
      .select("*")
      .where({
        neighborhood_name,
        neighborhood_city_id,
      })
      .first();

    return neighborhood;
  }
}

export { NeighborhoodRepository };
