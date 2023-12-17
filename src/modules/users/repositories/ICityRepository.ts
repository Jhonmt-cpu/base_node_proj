import { CityEntity } from "../infra/knex/entities/CityEntity";

type ICreateCityDTO = {
  city_name: string;
  city_state_id: number;
};

type ICityRepository = {
  create(data: ICreateCityDTO): Promise<CityEntity>;
};

export { ICreateCityDTO, ICityRepository };
