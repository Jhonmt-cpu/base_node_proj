import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { IStateRepository } from "@modules/account/repositories/IStateRepository";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class ListAllStatesUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("StateRepository")
    private statesRepository: IStateRepository,
  ) {}

  async execute(): Promise<StateEntity[]> {
    const statesInCache = await this.cacheProvider.cacheGet(
      cachePrefixes.listAllStates,
    );

    if (statesInCache) {
      return JSON.parse(statesInCache);
    }

    const states = await this.statesRepository.findAll();

    await this.cacheProvider.cacheSet({
      key: cachePrefixes.listAllStates,
      value: JSON.stringify(states),
      expiresInSeconds: 60 * 60 * 24,
    });

    return states;
  }
}

export { ListAllStatesUseCase };
