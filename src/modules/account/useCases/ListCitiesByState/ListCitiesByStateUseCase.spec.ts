import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { CityRepositoryInMemory } from "@modules/account/repositories/inMemory/CityRepositoryInMemory";
import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";

import { ListCitiesByStateUseCase } from "./ListCitiesByStateUseCase";

let databaseInMemory: DatabaseInMemory;

let stateRepositoryInMemory: StateRepositoryInMemory;

let cityRepositoryInMemory: CityRepositoryInMemory;

let listCitiesByStateUseCase: ListCitiesByStateUseCase;

describe("List Cities By State", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    stateRepositoryInMemory = new StateRepositoryInMemory(databaseInMemory);
    cityRepositoryInMemory = new CityRepositoryInMemory(databaseInMemory);

    listCitiesByStateUseCase = new ListCitiesByStateUseCase(
      stateRepositoryInMemory,
      cityRepositoryInMemory,
    );
  });

  it("should be able to list all cities by state", async () => {
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

    const cities = await listCitiesByStateUseCase.execute({
      state_id: state.state_id,
    });

    expect(cities).toEqual([city1, city2]);
  });

  it("should not be able to list all cities by state if state not exists", async () => {
    await expect(
      listCitiesByStateUseCase.execute({
        state_id: 1,
      }),
    ).rejects.toEqual(new AppError("State not found", 404));
  });

  it("should not be able to list all cities by state if state id is less or equal to 0", async () => {
    await expect(
      listCitiesByStateUseCase.execute({
        state_id: 0,
      }),
    ).rejects.toEqual(new AppError("Invalid state"));
    await expect(
      listCitiesByStateUseCase.execute({
        state_id: -1,
      }),
    ).rejects.toEqual(new AppError("Invalid state"));
  });
});
