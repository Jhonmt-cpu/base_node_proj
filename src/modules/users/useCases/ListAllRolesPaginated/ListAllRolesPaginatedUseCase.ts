import { inject, injectable } from "tsyringe";

import { IRoleRepository } from "@modules/users/repositories/IRoleRepository";
import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";

@injectable()
class ListAllRolesPaginatedUseCase {
  constructor(
    @inject("RoleRepository")
    private rolesRepository: IRoleRepository,
  ) {}

  async execute(data: IFindAllPaginatedDTO) {
    const roles = await this.rolesRepository.findAllPaginated(data);

    return roles;
  }
}

export { ListAllRolesPaginatedUseCase };
