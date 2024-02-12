import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { IFindAllPaginatedDTO } from "@modules/account/@types/IFindAllPaginatedDTO";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListAllGendersPaginatedUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("GenderRepository")
    private gendersRepository: IGenderRepository,
  ) {}

  async execute({ page, limit }: IFindAllPaginatedDTO) {
    const cacheKey = `${cachePrefixes.listAllGendersPaginated}:page:${page}:limit:${limit}`;

    const gendersCache = await this.cacheProvider.cacheGet(cacheKey);

    if (gendersCache) {
      return JSON.parse(gendersCache);
    }

    const genders = await this.gendersRepository.findAllPaginated({
      page,
      limit,
    });

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(genders),
      expiresInSeconds: 60 * 60 * 24,
    });

    return genders;
  }
}

export { ListAllGendersPaginatedUseCase };
