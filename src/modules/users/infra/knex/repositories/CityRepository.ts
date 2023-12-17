import {
  ICityRepository,
  ICreateCityDTO,
} from "../../../repositories/ICityRepository";
import { CityEntity } from "../entities/CityEntity";

class CityRepository implements ICityRepository {
  private static cities: CityEntity[] = [];

  async create(data: ICreateCityDTO): Promise<CityEntity> {
    const city = new CityEntity({
      city_id: CityRepository.cities.length + 1,
      city_name: data.city_name,
      city_state_id: data.city_state_id,
      city_created_at: new Date(),
    });

    CityRepository.cities.push(city);

    return city;
  }
}

export { CityRepository };
