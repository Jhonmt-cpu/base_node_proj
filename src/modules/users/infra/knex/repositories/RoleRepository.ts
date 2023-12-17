import {
  ICreateRoleDTO,
  IRoleRepository,
} from "../../../repositories/IRoleRepository";
import { RoleEntity } from "../entities/RoleEntity";

class RoleRepository implements IRoleRepository {
  private static roles: RoleEntity[] = [];

  async create(data: ICreateRoleDTO): Promise<RoleEntity> {
    const role = new RoleEntity({
      role_id: RoleRepository.roles.length + 1,
      role_name: data.role_name,
      role_created_at: new Date(),
    });

    RoleRepository.roles.push(role);

    return role;
  }

  async findByName(role_name: string): Promise<RoleEntity | undefined> {
    const role = RoleRepository.roles.find(
      (role) => role.role_name === role_name,
    );

    return role;
  }
}

export { RoleRepository };
