import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/account/repositories/inMemory/NeighborhoodRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";

import { ListNeighborhoodsByCityUseCase } from "./ListNeighborhoodsByCityUseCase";

let databaseInMemory: DatabaseInMemory;

let cityRepositoryInMemory: CityRepositoryInMemory;

let neighborhoodRepositoryInMemory: NeighborHoodRepositoryInMemory;

let listNeighborhoodsByCityUseCase: ListNeighborhoodsByCityUseCase;

describe("List Cities By State", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    cityRepositoryInMemory = new CityRepositoryInMemory(databaseInMemory);
    neighborhoodRepositoryInMemory = new NeighborHoodRepositoryInMemory(
      databaseInMemory,
    );

    listNeighborhoodsByCityUseCase = new ListNeighborhoodsByCityUseCase(
      cityRepositoryInMemory,
      neighborhoodRepositoryInMemory,
    );
  });

  it("should be able to list all neighborhoods by city", async () => {
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

    const neighborhoods = await listNeighborhoodsByCityUseCase.execute({
      city_id: city.city_id,
    });

    expect(neighborhoods).toEqual([neighborhood1, neighborhood2]);
  });

  it("should not be able to list all cities by state if state not exists", async () => {
    await expect(
      listNeighborhoodsByCityUseCase.execute({
        city_id: 1,
      }),
    ).rejects.toEqual(new AppError("City does not exists!", 404));
  });

  it("should not be able to list all cities by state if state id is less or equal to 0", async () => {
    await expect(
      listNeighborhoodsByCityUseCase.execute({
        city_id: 0,
      }),
    ).rejects.toEqual(new AppError("Invalid city!"));
    await expect(
      listNeighborhoodsByCityUseCase.execute({
        city_id: -1,
      }),
    ).rejects.toEqual(new AppError("Invalid city!"));
  });
});
