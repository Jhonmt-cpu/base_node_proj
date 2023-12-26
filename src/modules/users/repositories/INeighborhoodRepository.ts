import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";

type ICreateNeighborhoodRepositoryDTO = {
  neighborhood_name: string;
  neighborhood_city_id: number;
};

type INeighborhoodRepository = {
  create(data: ICreateNeighborhoodRepositoryDTO): Promise<NeighborhoodEntity>;
  findByCityId(neighborhood_city_id: number): Promise<NeighborhoodEntity[]>;
  findById(neighborhood_id: number): Promise<NeighborhoodEntity | undefined>;
};

export { INeighborhoodRepository, ICreateNeighborhoodRepositoryDTO };
