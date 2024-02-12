import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListAllGendersUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("GenderRepository")
    private gendersRepository: IGenderRepository,
  ) {}

  async execute() {
    const gendersInCache = await this.cacheProvider.cacheGet(
      cachePrefixes.listAllGenders,
    );

    if (gendersInCache) {
      return JSON.parse(gendersInCache);
    }

    const genders = await this.gendersRepository.findAll();

    await this.cacheProvider.cacheSet({
      key: cachePrefixes.listAllGenders,
      value: JSON.stringify(genders),
      expiresInSeconds: 60 * 60 * 24,
    });

    return genders;
  }
}

export { ListAllGendersUseCase };
