import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { RoleEntity } from "@modules/users/infra/knex/entities/RoleEntity";

import { ICreateRoleRepositoryDTO, IRoleRepository } from "../IRoleRepository";

import { DatabaseInMemory } from "./DatabaseInMemory";

class RoleRepositoryInMemory implements IRoleRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(data: ICreateRoleRepositoryDTO): Promise<RoleEntity> {
    const role = new RoleEntity({
      role_id: this.databaseInMemory.roles.length + 1,
      role_name: data.role_name,
      role_created_at: new Date(),
    });

    this.databaseInMemory.roles.push(role);

    return role;
  }

  async findByName(role_name: string): Promise<RoleEntity | undefined> {
    const role = this.databaseInMemory.roles.find(
      (role) => role.role_name === role_name,
    );

    return role;
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllPaginatedDTO): Promise<RoleEntity[]> {
    const roles = this.databaseInMemory.roles.slice(
      (page - 1) * limit,
      page * limit,
    );

    return roles;
  }
}

export { RoleRepositoryInMemory };
