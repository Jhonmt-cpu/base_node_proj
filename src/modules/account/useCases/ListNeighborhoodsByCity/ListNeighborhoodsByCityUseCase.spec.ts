import { cachePrefixes } from "@config/cache";

import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/account/repositories/inMemory/NeighborhoodRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { ListNeighborhoodsByCityUseCase } from "./ListNeighborhoodsByCityUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let cityRepositoryInMemory: CityRepositoryInMemory;

let neighborhoodRepositoryInMemory: NeighborHoodRepositoryInMemory;

let listNeighborhoodsByCityUseCase: ListNeighborhoodsByCityUseCase;

describe("List Cities By State", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    cityRepositoryInMemory = new CityRepositoryInMemory(databaseInMemory);
    neighborhoodRepositoryInMemory = new NeighborHoodRepositoryInMemory(
      databaseInMemory,
    );

    listNeighborhoodsByCityUseCase = new ListNeighborhoodsByCityUseCase(
      cacheProvider,
      cityRepositoryInMemory,
      neighborhoodRepositoryInMemory,
    );
  });

  it("should be able to list all neighborhoods by city and create cache", async () => {
    const city = await cityRepositoryInMemory.create({
      city_name: "city_test",
      city_state_id: 1,
    });

    const city2 = await cityRepositoryInMemory.create({
      city_name: "city_test2",
      city_state_id: 1,
    });

    const neighborhood1 = await neighborhoodRepositoryInMemory.create({
      neighborhood_name: "neighborhood_test",
      neighborhood_city_id: city.city_id,
    });

    const neighborhood2 = await neighborhoodRepositoryInMemory.create({
      neighborhood_name: "neighborhood_test2",
      neighborhood_city_id: city.city_id,
    });

    await neighborhoodRepositoryInMemory.create({
      neighborhood_name: "neighborhood_test3",
      neighborhood_city_id: city2.city_id,
    });

    const cacheKey = `${cachePrefixes.listNeighborhoodsByCity}:city_id:${city.city_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const neighborhoods = await listNeighborhoodsByCityUseCase.execute({
      city_id: city.city_id,
    });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(neighborhoods).toEqual([neighborhood1, neighborhood2]);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
  });

  it("should not be able to list all cities by state if state not exists", async () => {
    await expect(
      listNeighborhoodsByCityUseCase.execute({
        city_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.CITY_NOT_FOUND, 404));
  });
});
