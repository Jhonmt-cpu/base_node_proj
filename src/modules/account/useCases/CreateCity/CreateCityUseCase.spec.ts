import { cachePrefixes } from "@config/cache";

import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { AppError } from "@shared/errors/AppError";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";

import { CreateCityUseCase } from "./CreateCityUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let stateRepository: StateRepositoryInMemory;

let cityRepository: CityRepositoryInMemory;

let createCityUseCase: CreateCityUseCase;

describe("Create City", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    stateRepository = new StateRepositoryInMemory(databaseInMemory);
    cityRepository = new CityRepositoryInMemory(databaseInMemory);

    createCityUseCase = new CreateCityUseCase(
      cacheProvider,
      stateRepository,
      cityRepository,
    );
  });

  it("should be able to create a new city and erase cache", async () => {
    const state = await stateRepository.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state.state_id}`;

    await cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const city = await createCityUseCase.execute({
      city_name: "city_test",
      city_state_id: state.state_id,
    });

    const cacheValue = await cacheProvider.cacheGet(cacheKey);

    expect(city).toHaveProperty("city_id");
    expect(city.city_name).toEqual("city_test");
    expect(city.city_state_id).toEqual(state.state_id);
    expect(cacheValueBefore).not.toBeNull();
    expect(cacheValue).toBeNull();
  });

  it("should not be able to create a new city with invalid state", async () => {
    await expect(
      createCityUseCase.execute({
        city_name: "city_test",
        city_state_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.STATE_NOT_FOUND, 404));
  });

  it("should not be able to create a new city with same name and state", async () => {
    const state = await stateRepository.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const city = await cityRepository.create({
      city_name: "city_test",
      city_state_id: state.state_id,
    });

    await expect(
      createCityUseCase.execute({
        city_name: city.city_name,
        city_state_id: state.state_id,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.CITY_ALREADY_EXISTS));
  });
});
