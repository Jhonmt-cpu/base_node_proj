import { ICreateRoleDTO } from "@modules/users/@types/ICreateRoleDTO";
import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { RoleEntity } from "@modules/users/infra/knex/entities/RoleEntity";

import { IRoleRepository } from "../IRoleRepository";

class RoleRepositoryInMemory implements IRoleRepository {
  private roles: RoleEntity[] = [];

  async create(data: ICreateRoleDTO): Promise<RoleEntity> {
    const role = new RoleEntity({
      role_id: this.roles.length + 1,
      role_name: data.role_name,
      role_created_at: new Date(),
    });

    this.roles.push(role);

    return role;
  }

  async findByName(role_name: string): Promise<RoleEntity | undefined> {
    const role = this.roles.find((role) => role.role_name === role_name);

    return role;
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllPaginatedDTO): Promise<RoleEntity[]> {
    const roles = this.roles.slice((page - 1) * limit, page * limit);

    return roles;
  }
}

export { RoleRepositoryInMemory };
