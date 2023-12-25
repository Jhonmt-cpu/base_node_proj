import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";

import { ICreateNeighborhoodDTO } from "@modules/users/@types/ICreateNeighborhoodDTO";
import { IFindNeighborhoodsByCityDTO } from "@modules/users/@types/IFindNeighborhoodsByCityDTO";

import { INeighborhoodRepository } from "../INeighborhoodRepository";

class NeighborHoodRepositoryInMemory implements INeighborhoodRepository {
  private neighborhoods: NeighborhoodEntity[] = [];

  async create(data: ICreateNeighborhoodDTO): Promise<NeighborhoodEntity> {
    const neighborhood = new NeighborhoodEntity({
      neighborhood_id: this.neighborhoods.length + 1,
      neighborhood_name: data.neighborhood_name,
      neighborhood_city_id: data.neighborhood_city_id,
      neighborhood_created_at: new Date(),
    });

    this.neighborhoods.push(neighborhood);

    return neighborhood;
  }

  async findByCityId({
    city_id,
  }: IFindNeighborhoodsByCityDTO): Promise<NeighborhoodEntity[]> {
    const neighborhoods = this.neighborhoods.filter(
      (neighborhood) => neighborhood.neighborhood_city_id === city_id,
    );

    return neighborhoods;
  }

  async findById(
    neighborhood_id: number,
  ): Promise<NeighborhoodEntity | undefined> {
    const neighborhood = this.neighborhoods.find(
      (neighborhood) => neighborhood.neighborhood_id === neighborhood_id,
    );

    return neighborhood;
  }
}

export { NeighborHoodRepositoryInMemory };
