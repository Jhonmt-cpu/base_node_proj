import { INeighborhoodRepository } from "@modules/users/repositories/INeighborhoodRepository";
import { ICreateNeighborhoodDTO } from "@modules/users/@types/ICreateNeighborhoodDTO";

import { NeighborhoodEntity } from "../entities/NeighborhoodEntity";
import { IFindNeighborhoodsByCityDTO } from "@modules/users/@types/IFindNeighborhoodsByCityDTO";
import { dbConnection } from "@shared/infra/database/knex";
class NeighborhoodRepository implements INeighborhoodRepository {
  async create(data: ICreateNeighborhoodDTO): Promise<NeighborhoodEntity> {
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

  async findByCityId({
    city_id,
  }: IFindNeighborhoodsByCityDTO): Promise<NeighborhoodEntity[]> {
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
}

export { NeighborhoodRepository };
