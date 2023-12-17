import { RoleEntity } from "../infra/knex/entities/RoleEntity";

type ICreateRoleDTO = {
  role_name: string;
};

type IRoleRepository = {
  create(data: ICreateRoleDTO): Promise<RoleEntity>;
  findByName(role_name: string): Promise<RoleEntity | undefined>;
};

export { IRoleRepository, ICreateRoleDTO };
