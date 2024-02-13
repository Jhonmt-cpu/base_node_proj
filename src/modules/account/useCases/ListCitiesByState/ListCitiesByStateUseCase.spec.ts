import { cachePrefixes } from "@config/cache";

import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { ListCitiesByStateUseCase } from "./ListCitiesByStateUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let stateRepositoryInMemory: StateRepositoryInMemory;

let cityRepositoryInMemory: CityRepositoryInMemory;

let listCitiesByStateUseCase: ListCitiesByStateUseCase;

describe("List Cities By State", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    stateRepositoryInMemory = new StateRepositoryInMemory(databaseInMemory);
    cityRepositoryInMemory = new CityRepositoryInMemory(databaseInMemory);

    listCitiesByStateUseCase = new ListCitiesByStateUseCase(
      cacheProvider,
      stateRepositoryInMemory,
      cityRepositoryInMemory,
    );
  });

  it("should be able to list all cities by state and create cache", async () => {
    const state = await stateRepositoryInMemory.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const state2 = await stateRepositoryInMemory.create({
      state_name: "state_test2",
      state_uf: "S2",
    });

    const city1 = await cityRepositoryInMemory.create({
      city_name: "city_test",
      city_state_id: state.state_id,
    });

    const city2 = await cityRepositoryInMemory.create({
      city_name: "city_test2",
      city_state_id: state.state_id,
    });

    await cityRepositoryInMemory.create({
      city_name: "city_test3",
      city_state_id: state2.state_id,
    });

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state.state_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const cities = await listCitiesByStateUseCase.execute({
      state_id: state.state_id,
    });

    const cacheValue = await cacheProvider.cacheGet(cacheKey);

    expect(cities).toEqual([city1, city2]);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValue).not.toBeNull();
  });

  it("should be able to list all cities by state from cache", async () => {
    const state = await stateRepositoryInMemory.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    await cityRepositoryInMemory.create({
      city_name: "city_test",
      city_state_id: state.state_id,
    });

    const firstResponse = await listCitiesByStateUseCase.execute({
      state_id: state.state_id,
    });

    const spyOnCache = jest.spyOn(cacheProvider, "cacheGet");

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state.state_id}`;

    const secondResponse = await listCitiesByStateUseCase.execute({
      state_id: state.state_id,
    });

    const valueCacheReturned = await spyOnCache.mock.results[0].value;

    expect(JSON.stringify(firstResponse)).toEqual(
      JSON.stringify(secondResponse),
    );
    expect(spyOnCache).toHaveBeenCalledWith(cacheKey);
    expect(JSON.stringify(firstResponse)).toEqual(valueCacheReturned);
  });

  it("should not be able to list all cities by state if state not exists", async () => {
    await expect(
      listCitiesByStateUseCase.execute({
        state_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.STATE_NOT_FOUND, 404));
  });
});
