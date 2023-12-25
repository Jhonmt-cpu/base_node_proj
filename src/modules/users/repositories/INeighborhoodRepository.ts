import { NeighborhoodEntity } from "@modules/users/infra/knex/entities/NeighborhoodEntity";

import { ICreateNeighborhoodDTO } from "../@types/ICreateNeighborhoodDTO";
import { IFindNeighborhoodsByCityDTO } from "../@types/IFindNeighborhoodsByCityDTO";

type INeighborhoodRepository = {
  create(data: ICreateNeighborhoodDTO): Promise<NeighborhoodEntity>;
  findByCityId(
    data: IFindNeighborhoodsByCityDTO,
  ): Promise<NeighborhoodEntity[]>;
  findById(neighborhood_id: number): Promise<NeighborhoodEntity | undefined>;
};

export { INeighborhoodRepository };
