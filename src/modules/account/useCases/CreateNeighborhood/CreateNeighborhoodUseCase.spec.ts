import { cachePrefixes } from "@config/cache";

import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/account/repositories/inMemory/NeighborhoodRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";
import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { CreateNeighborhoodUseCase } from "./CreateNeighborhoodUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let cityRepository: CityRepositoryInMemory;

let neighborhoodRepository: NeighborHoodRepositoryInMemory;

let createNeighborhoodUseCase: CreateNeighborhoodUseCase;

describe("Create Neighborhood", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    cityRepository = new CityRepositoryInMemory(databaseInMemory);
    neighborhoodRepository = new NeighborHoodRepositoryInMemory(
      databaseInMemory,
    );

    createNeighborhoodUseCase = new CreateNeighborhoodUseCase(
      cacheProvider,
      cityRepository,
      neighborhoodRepository,
    );
  });

  it("Should be able to create a new neighborhood and erase cache", async () => {
    const city = await cityRepository.create({
      city_name: "city_test",
      city_state_id: 1,
    });

    const cacheKey = `${cachePrefixes.listNeighborhoodsByCity}:city_id:${city.city_id}`;

    await cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const neighborhood = await createNeighborhoodUseCase.execute({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: city.city_id,
    });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(neighborhood).toHaveProperty("neighborhood_id");
    expect(neighborhood.neighborhood_name).toEqual("neighborhood_test");
    expect(neighborhood.neighborhood_city_id).toEqual(city.city_id);
    expect(cacheValueBefore).not.toBeNull();
    expect(cacheValueAfter).toBeNull();
  });

  it("Should not be able to create a neighborhood if city not exists", async () => {
    await expect(
      createNeighborhoodUseCase.execute({
        neighborhood_name: "neighborhood_test",
        neighborhood_city_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.CITY_NOT_FOUND, 404));
  });

  it("Should not be able to create a neighborhood if name already exists", async () => {
    const city = await cityRepository.create({
      city_name: "city_test",
      city_state_id: 1,
    });

    const neighborhood = await neighborhoodRepository.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: city.city_id,
    });

    await expect(
      createNeighborhoodUseCase.execute({
        neighborhood_name: neighborhood.neighborhood_name,
        neighborhood_city_id: city.city_id,
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.NEIGHBORHOOD_ALREADY_EXISTS),
    );
  });
});
