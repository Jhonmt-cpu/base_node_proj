import { CityRepositoryInMemory } from "@modules/users/repositories/inMemory/CityRepositoryInMemory";
import { DatabaseInMemory } from "@modules/users/repositories/inMemory/DatabaseInMemory";
import { StateRepositoryInMemory } from "@modules/users/repositories/inMemory/StateRepositoryInMemory";

import { CreateCityUseCase } from "./CreateCityUseCase";
import { AppError } from "@shared/errors/AppError";

let databaseInMemory: DatabaseInMemory;

let stateRepository: StateRepositoryInMemory;

let cityRepository: CityRepositoryInMemory;

let createCityUseCase: CreateCityUseCase;

describe("Create City", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    stateRepository = new StateRepositoryInMemory(databaseInMemory);
    cityRepository = new CityRepositoryInMemory(databaseInMemory);

    createCityUseCase = new CreateCityUseCase(stateRepository, cityRepository);
  });

  it("should be able to create a new city", async () => {
    const state = await stateRepository.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const city = await createCityUseCase.execute({
      city_name: "city_test",
      city_state_id: state.state_id,
    });

    expect(city).toHaveProperty("city_id");
    expect(city.city_name).toEqual("city_test");
    expect(city.city_state_id).toEqual(state.state_id);
  });

  it("should not be able to create a new city with invalid state", async () => {
    await expect(
      createCityUseCase.execute({
        city_name: "city_test",
        city_state_id: 1,
      }),
    ).rejects.toEqual(new AppError("State not found!", 404));
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
    ).rejects.toEqual(new AppError("City already exists!"));
  });
});
