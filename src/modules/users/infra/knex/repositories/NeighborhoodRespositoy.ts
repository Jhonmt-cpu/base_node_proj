import {
  ICreateNeighborhoodDTO,
  INeighborhoodRepository,
} from "../../../repositories/INeighborhoodRepository";
import { NeighborhoodEntity } from "../entities/NeighborhoodEntity";

class NeighborhoodRepository implements INeighborhoodRepository {
  private static neighborhoods: NeighborhoodEntity[] = [];

  async create(data: ICreateNeighborhoodDTO): Promise<NeighborhoodEntity> {
    const neighborhood = new NeighborhoodEntity({
      neighborhood_id: NeighborhoodRepository.neighborhoods.length + 1,
      neighborhood_name: data.neighborhood_name,
      neighborhood_city_id: data.neighborhood_city_id,
      neighborhood_created_at: new Date(),
    });

    NeighborhoodRepository.neighborhoods.push(neighborhood);

    return neighborhood;
  }
}

export { NeighborhoodRepository };
