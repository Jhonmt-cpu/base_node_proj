import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IRoleRepository } from "@modules/account/repositories/IRoleRepository";
import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";

import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListAllRolesPaginatedUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("RoleRepository")
    private rolesRepository: IRoleRepository,
  ) {}

  async execute({ page, limit }: IFindAllPaginatedDTO) {
    const cacheKey = `${cachePrefixes.listAllRolesPaginated}:page:${page}:limit:${limit}`;

    const rolesCached = await this.cacheProvider.cacheGet(cacheKey);

    if (rolesCached) {
      return JSON.parse(rolesCached);
    }

    const roles = await this.rolesRepository.findAllPaginated({ page, limit });

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(roles),
      expiresInSeconds: 60 * 60 * 24,
    });

    return roles;
  }
}

export { ListAllRolesPaginatedUseCase };
