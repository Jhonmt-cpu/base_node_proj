import { dbConnection } from "@shared/infra/database/knex";

import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";
import {
  ICreateRoleRepositoryDTO,
  IRoleRepository,
} from "@modules/account/repositories/IRoleRepository";

import { RoleEntity } from "../entities/RoleEntity";

class RoleRepository implements IRoleRepository {
  async create(data: ICreateRoleRepositoryDTO): Promise<RoleEntity> {
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
