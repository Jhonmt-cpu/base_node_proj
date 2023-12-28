import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";

type ICreateCityRepositoryDTO = {
  city_name: string;
  city_state_id: number;
};

type IFindCitiesByStateRepositoryDTO = {
  state_id: number;
};

type IFindByNameAndStateRepositoryDTO = {
  city_name: string;
  city_state_id: number;
};

type ICityRepository = {
  create(data: ICreateCityRepositoryDTO): Promise<CityEntity>;
  findByState(data: IFindCitiesByStateRepositoryDTO): Promise<CityEntity[]>;
  findById(id: number): Promise<CityEntity | undefined>;
  findByNameAndState(
    data: IFindByNameAndStateRepositoryDTO,
  ): Promise<CityEntity | undefined>;
};

export {
  ICityRepository,
  ICreateCityRepositoryDTO,
  IFindCitiesByStateRepositoryDTO,
  IFindByNameAndStateRepositoryDTO,
};
