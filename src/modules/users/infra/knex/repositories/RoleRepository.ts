import { dbConnection } from "@shared/infra/database/knex";

import { ICreateRoleDTO } from "@modules/users/@types/ICreateRoleDTO";
import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { IRoleRepository } from "@modules/users/repositories/IRoleRepository";

import { RoleEntity } from "../entities/RoleEntity";

class RoleRepository implements IRoleRepository {
  async create(data: ICreateRoleDTO): Promise<RoleEntity> {
    const role = await dbConnection<RoleEntity>("tb_roles")
      .insert({
        role_name: data.role_name,
      })
      .returning("*");

    return role[0];
  }

  async findByName(role_name: string): Promise<RoleEntity | undefined> {
    const role = await dbConnection<RoleEntity>("tb_roles")
      .select("*")
      .where({
        role_name,
      })
      .first();

    return role;
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllPaginatedDTO): Promise<RoleEntity[]> {
    const roles = await dbConnection<RoleEntity>("tb_roles")
      .select("*")
      .limit(limit)
      .offset((page - 1) * limit);

    return roles;
  }
}

export { RoleRepository };
