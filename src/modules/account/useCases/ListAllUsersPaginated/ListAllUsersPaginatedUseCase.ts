import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";

import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListAllUsersPaginatedUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ page, limit }: IFindAllPaginatedDTO) {
    const cacheKey = `${cachePrefixes.listAllUsersPaginated}:page:${page}:limit:${limit}`;

    const usersCached = await this.cacheProvider.cacheGet(cacheKey);

    if (usersCached) {
      return JSON.parse(usersCached);
    }

    const users = await this.userRepository.findAllPaginated({ page, limit });

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(users),
      expiresInSeconds: 60 * 60 * 24,
    });

    return users;
  }
}

export { ListAllUsersPaginatedUseCase };
