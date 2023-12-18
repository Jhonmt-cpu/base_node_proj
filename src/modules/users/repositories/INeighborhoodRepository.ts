import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";

type ICreateNeighborhoodDTO = {
  neighborhood_name: string;
  neighborhood_city_id: number;
};

type INeighborhoodRepository = {
  create(data: ICreateNeighborhoodDTO): Promise<NeighborhoodEntity>;
};

export { ICreateNeighborhoodDTO, INeighborhoodRepository };
