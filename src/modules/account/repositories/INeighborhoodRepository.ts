import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";

type ICreateNeighborhoodRepositoryDTO = {
  neighborhood_name: string;
  neighborhood_city_id: number;
};

type IFindNeighborhoodByNameAndCityRepositoryDTO = {
  neighborhood_name: string;
  neighborhood_city_id: number;
};

type INeighborhoodRepository = {
  create(data: ICreateNeighborhoodRepositoryDTO): Promise<NeighborhoodEntity>;
  findByCityId(neighborhood_city_id: number): Promise<NeighborhoodEntity[]>;
  findById(neighborhood_id: number): Promise<NeighborhoodEntity | undefined>;
  findByNameAndCity(
    data: IFindNeighborhoodByNameAndCityRepositoryDTO,
  ): Promise<NeighborhoodEntity | undefined>;
};

export {
  INeighborhoodRepository,
  ICreateNeighborhoodRepositoryDTO,
  IFindNeighborhoodByNameAndCityRepositoryDTO,
};
