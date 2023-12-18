import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";

import {
  ICreateNeighborhoodDTO,
  INeighborhoodRepository,
} from "../INeighborhoodRepository";

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
}

export { NeighborHoodRepositoryInMemory };
