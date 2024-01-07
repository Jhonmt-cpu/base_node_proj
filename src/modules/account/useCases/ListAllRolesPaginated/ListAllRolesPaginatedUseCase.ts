import { inject, injectable } from "tsyringe";

import { IRoleRepository } from "@modules/account/repositories/IRoleRepository";
import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";

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
