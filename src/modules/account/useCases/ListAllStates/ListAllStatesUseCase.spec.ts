import { cachePrefixes } from "@config/cache";

import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { ListAllStatesUseCase } from "./ListAllStatesUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let stateRepositoryInMemory: StateRepositoryInMemory;

let listAllStatesUseCase: ListAllStatesUseCase;

describe("List All States", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    stateRepositoryInMemory = new StateRepositoryInMemory(databaseInMemory);

    listAllStatesUseCase = new ListAllStatesUseCase(
      cacheProvider,
      stateRepositoryInMemory,
    );
  });

  it("should be able to list all states and create cache", async () => {
    const state = await stateRepositoryInMemory.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const cacheKey = cachePrefixes.listAllStates;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const states = await listAllStatesUseCase.execute();

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(states).toEqual([state]);
    expect(cacheValueBefore).toBe(null);
    expect(cacheValueAfter).not.toBe(null);
  });
});
