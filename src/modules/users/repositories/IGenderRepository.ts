import { GenderEntity } from "@modules/users/infra/knex/entities/GenderEntity";

type ICreateGenderRepositoryDTO = {
  gender_name: string;
};

type IFindAllGendersPaginatedRepositoryDTO = {
  page: number;
  limit: number;
};

type IGenderRepository = {
  create(data: ICreateGenderRepositoryDTO): Promise<GenderEntity>;
  findAllPaginated(
    data: IFindAllGendersPaginatedRepositoryDTO,
  ): Promise<GenderEntity[]>;
  findAll(): Promise<GenderEntity[]>;
  findById(gender_id: number): Promise<GenderEntity | undefined>;
  findByName(gender_name: string): Promise<GenderEntity | undefined>;
};

export {
  IGenderRepository,
  ICreateGenderRepositoryDTO,
  IFindAllGendersPaginatedRepositoryDTO,
};
