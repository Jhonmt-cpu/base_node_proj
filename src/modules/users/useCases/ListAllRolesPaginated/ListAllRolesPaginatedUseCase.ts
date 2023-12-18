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
    if (data.page <= 0 || data.limit <= 0) {
      data.page = 1;
      data.limit = 20;
    }

    const roles = await this.rolesRepository.findAllPaginated(data);

    return roles;
  }
}

export { ListAllRolesPaginatedUseCase };
