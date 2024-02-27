import { cachePrefixes } from "@config/cache";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";

import { ListAllGendersUseCase } from "./ListAllGendersUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let genderRepositoryInMemory: GenderRepositoryInMemory;

let listAllGendersUseCase: ListAllGendersUseCase;

describe("List All Genders", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    genderRepositoryInMemory = new GenderRepositoryInMemory(databaseInMemory);

    listAllGendersUseCase = new ListAllGendersUseCase(
      cacheProvider,
      genderRepositoryInMemory,
    );
  });

  it("should be able to list all genders and create cache", async () => {
    const gender = await genderRepositoryInMemory.create({
      gender_name: "gender_test",
    });

    const cacheKey = cachePrefixes.listAllGenders;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const genders = await listAllGendersUseCase.execute();

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(genders).toEqual([gender]);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
  });

  it("should be able to list all genders from cache", async () => {
    await genderRepositoryInMemory.create({
      gender_name: "gender_test 2",
    });

    const firstResponse = await listAllGendersUseCase.execute();

    const cacheKey = cachePrefixes.listAllGenders;

    const spyCache = jest.spyOn(cacheProvider, "cacheGet");

    const secondResponse = await listAllGendersUseCase.execute();

    const valueCacheReturned = await spyCache.mock.results[0].value;

    expect(JSON.stringify(firstResponse)).toEqual(
      JSON.stringify(secondResponse),
    );
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(valueCacheReturned).toEqual(JSON.stringify(firstResponse));
  });
});
