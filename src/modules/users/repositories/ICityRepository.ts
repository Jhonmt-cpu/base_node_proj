import { CityEntity } from "@modules/users/infra/knex/entities/CityEntity";
import { ICreateCityDTO } from "../@types/ICreateCityDTO";
import { IFindCitiesByStateDTO } from "../@types/IFindCitiesByStateDTO";

type ICityRepository = {
  create(data: ICreateCityDTO): Promise<CityEntity>;
  findByState(data: IFindCitiesByStateDTO): Promise<CityEntity[]>;
  findById(id: number): Promise<CityEntity | undefined>;
};

export { ICityRepository };
