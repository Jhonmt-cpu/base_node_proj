import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";

import {
  INeighborhoodRepository,
  ICreateNeighborhoodRepositoryDTO,
  IFindNeighborhoodByNameAndCityRepositoryDTO,
} from "../INeighborhoodRepository";

import { DatabaseInMemory } from "./DatabaseInMemory";

class NeighborHoodRepositoryInMemory implements INeighborhoodRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(
    data: ICreateNeighborhoodRepositoryDTO,
  ): Promise<NeighborhoodEntity> {
    const neighborhood = new NeighborhoodEntity({
      neighborhood_id: this.databaseInMemory.neighborhoods.length + 1,
      neighborhood_name: data.neighborhood_name,
      neighborhood_city_id: data.neighborhood_city_id,
      neighborhood_created_at: new Date(),
    });

    this.databaseInMemory.neighborhoods.push(neighborhood);

    return neighborhood;
  }

  async findByCityId(city_id: number): Promise<NeighborhoodEntity[]> {
    const neighborhoods = this.databaseInMemory.neighborhoods.filter(
      (neighborhood) => neighborhood.neighborhood_city_id === city_id,
    );

    return neighborhoods;
  }

  async findById(
    neighborhood_id: number,
  ): Promise<NeighborhoodEntity | undefined> {
    const neighborhood = this.databaseInMemory.neighborhoods.find(
      (neighborhood) => neighborhood.neighborhood_id === neighborhood_id,
    );

    return neighborhood;
  }

  async findByNameAndCity({
    neighborhood_city_id,
    neighborhood_name,
  }: IFindNeighborhoodByNameAndCityRepositoryDTO): Promise<
    NeighborhoodEntity | undefined
  > {
    const neighborhood = this.databaseInMemory.neighborhoods.find(
      (neighborhood) =>
        neighborhood.neighborhood_name === neighborhood_name &&
        neighborhood.neighborhood_city_id === neighborhood_city_id,
    );

    return neighborhood;
  }
}

export { NeighborHoodRepositoryInMemory };
