import { cachePrefixes } from "@config/cache";

import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { CreateStateUseCase } from "./CreateStateUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let stateRepository: StateRepositoryInMemory;

let createStateUseCase: CreateStateUseCase;

describe("Create State", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    stateRepository = new StateRepositoryInMemory(databaseInMemory);

    createStateUseCase = new CreateStateUseCase(cacheProvider, stateRepository);
  });

  it("should be able to create a new state and erase cache", async () => {
    const cacheKey = `${cachePrefixes.listAllStates}`;

    await cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const state = await createStateUseCase.execute({
      state_name: "state_test",
      state_uf: "ST",
    });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(state).toHaveProperty("state_id");
    expect(state.state_name).toEqual("state_test");
    expect(state.state_uf).toEqual("ST");
    expect(cacheValueBefore).not.toBeNull();
    expect(cacheValueAfter).toBeNull();
  });

  it("should not be able to create a new state with same name and uf", async () => {
    await stateRepository.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    await expect(
      createStateUseCase.execute({
        state_name: "state_test",
        state_uf: "ST",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.STATE_ALREADY_EXISTS));
  });
});
