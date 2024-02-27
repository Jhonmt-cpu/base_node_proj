import { cachePrefixes } from "@config/cache";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";

import { ListAllGendersPaginatedUseCase } from "./ListAllGendersPaginatedUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let listAllGendersPaginatedUseCase: ListAllGendersPaginatedUseCase;

let genderRepositoryInMemory: GenderRepositoryInMemory;

describe("List All Genders Paginated and create cache", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    genderRepositoryInMemory = new GenderRepositoryInMemory(databaseInMemory);

    listAllGendersPaginatedUseCase = new ListAllGendersPaginatedUseCase(
      cacheProvider,
      genderRepositoryInMemory,
    );
  });

  it("should be able to list all genders with pagination and create cache", async () => {
    for (let i = 0; i < 20; i++) {
      await genderRepositoryInMemory.create({
        gender_name: `gender_test_${i}`,
      });
    }

    const genders10Params = {
      page: 1,
      limit: 10,
    };

    const genders5Params = {
      page: 4,
      limit: 5,
    };

    const genders30Params = {
      page: 1,
      limit: 30,
    };

    const cacheKey10 = `${cachePrefixes.listAllGendersPaginated}:page:${genders10Params.page}:limit:${genders10Params.limit}`;

    const cacheKey5 = `${cachePrefixes.listAllGendersPaginated}:page:${genders5Params.page}:limit:${genders5Params.limit}`;

    const cacheKey30 = `${cachePrefixes.listAllGendersPaginated}:page:${genders30Params.page}:limit:${genders30Params.limit}`;

    const cacheValueBefore10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueBefore5 = await cacheProvider.cacheGet(cacheKey5);

    const cacheValueBefore30 = await cacheProvider.cacheGet(cacheKey30);

    const genders10 = await listAllGendersPaginatedUseCase.execute(
      genders10Params,
    );
    const genders5 = await listAllGendersPaginatedUseCase.execute(
      genders5Params,
    );
    const genders30 = await listAllGendersPaginatedUseCase.execute(
      genders30Params,
    );

    const cacheValueAfter10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueAfter5 = await cacheProvider.cacheGet(cacheKey5);

    const cacheValueAfter30 = await cacheProvider.cacheGet(cacheKey30);

    expect(genders10.length).toEqual(10);
    expect(genders5.length).toEqual(5);
    expect(genders30.length).toEqual(20);
    expect(genders30[0].gender_name).toEqual("gender_test_0");
    expect(genders5[0].gender_name).toEqual("gender_test_15");
    expect(cacheValueBefore10).toBeNull();
    expect(cacheValueBefore5).toBeNull();
    expect(cacheValueBefore30).toBeNull();
    expect(cacheValueAfter10).not.toBeNull();
    expect(cacheValueAfter5).not.toBeNull();
    expect(cacheValueAfter30).not.toBeNull();
  });

  it("should be able to list all genders with pagination and use cache", async () => {
    for (let i = 0; i < 20; i++) {
      await genderRepositoryInMemory.create({
        gender_name: `gender_test_${i}`,
      });
    }

    const genders10Params = {
      page: 1,
      limit: 10,
    };

    const genders5Params = {
      page: 4,
      limit: 5,
    };

    const genders30Params = {
      page: 1,
      limit: 30,
    };

    const firstGet10 = await listAllGendersPaginatedUseCase.execute(
      genders10Params,
    );

    const firstGet5 = await listAllGendersPaginatedUseCase.execute(
      genders5Params,
    );

    const firstGet30 = await listAllGendersPaginatedUseCase.execute(
      genders30Params,
    );

    const cacheKey10 = `${cachePrefixes.listAllGendersPaginated}:page:${genders10Params.page}:limit:${genders10Params.limit}`;

    const cacheKey5 = `${cachePrefixes.listAllGendersPaginated}:page:${genders5Params.page}:limit:${genders5Params.limit}`;

    const cacheKey30 = `${cachePrefixes.listAllGendersPaginated}:page:${genders30Params.page}:limit:${genders30Params.limit}`;

    const spyCacheProvider = jest.spyOn(cacheProvider, "cacheGet");

    const secondGet10 = await listAllGendersPaginatedUseCase.execute(
      genders10Params,
    );

    const secondGet5 = await listAllGendersPaginatedUseCase.execute(
      genders5Params,
    );

    const secondGet30 = await listAllGendersPaginatedUseCase.execute(
      genders30Params,
    );

    const spyCacheReturnedValue10 = await spyCacheProvider.mock.results[0]
      .value;

    const spyCacheReturnedValue5 = await spyCacheProvider.mock.results[1].value;

    const spyCacheReturnedValue30 = await spyCacheProvider.mock.results[2]
      .value;

    expect(JSON.stringify(firstGet10)).toEqual(JSON.stringify(secondGet10));
    expect(JSON.stringify(firstGet5)).toEqual(JSON.stringify(secondGet5));
    expect(JSON.stringify(firstGet30)).toEqual(JSON.stringify(secondGet30));
    expect(spyCacheProvider).toHaveBeenCalledWith(cacheKey10);
    expect(spyCacheProvider).toHaveBeenCalledWith(cacheKey5);
    expect(spyCacheProvider).toHaveBeenCalledWith(cacheKey30);
    expect(spyCacheReturnedValue10).toBe(JSON.stringify(firstGet10));
    expect(spyCacheReturnedValue5).toBe(JSON.stringify(firstGet5));
    expect(spyCacheReturnedValue30).toBe(JSON.stringify(firstGet30));
  });
});
