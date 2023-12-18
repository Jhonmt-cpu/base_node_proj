import { ICreateRoleDTO } from "@modules/users/@types/ICreateRoleDTO";
import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { RoleEntity } from "@modules/users/infra/knex/entities/RoleEntity";

type IRoleRepository = {
  create(data: ICreateRoleDTO): Promise<RoleEntity>;
  findByName(role_name: string): Promise<RoleEntity | undefined>;
  findAllPaginated(data: IFindAllPaginatedDTO): Promise<RoleEntity[]>;
};

export { IRoleRepository };
