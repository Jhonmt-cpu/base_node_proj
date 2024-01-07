import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";

type ICreateRoleRepositoryDTO = {
  role_name: string;
};

type IFindAllRolesPaginatedRepositoryDTO = {
  page: number;
  limit: number;
};

type IRoleRepository = {
  create(data: ICreateRoleRepositoryDTO): Promise<RoleEntity>;
  findByName(role_name: string): Promise<RoleEntity | undefined>;
  findAllPaginated(
    data: IFindAllRolesPaginatedRepositoryDTO,
  ): Promise<RoleEntity[]>;
};

export {
  IRoleRepository,
  ICreateRoleRepositoryDTO,
  IFindAllRolesPaginatedRepositoryDTO,
};
