import { StateRepositoryInMemory } from "@modules/users/repositories/inMemory/StateRepositoryInMemory";
import { DatabaseInMemory } from "@modules/users/repositories/inMemory/DatabaseInMemory";

import { ListAllStatesUseCase } from "./ListAllStatesUseCase";

let databaseInMemory: DatabaseInMemory;

let stateRepositoryInMemory: StateRepositoryInMemory;

let listAllStatesUseCase: ListAllStatesUseCase;

describe("List All States", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    stateRepositoryInMemory = new StateRepositoryInMemory(databaseInMemory);

    listAllStatesUseCase = new ListAllStatesUseCase(stateRepositoryInMemory);
  });

  it("should be able to list all states", async () => {
    const state = await stateRepositoryInMemory.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    const states = await listAllStatesUseCase.execute();

    expect(states).toEqual([state]);
  });
});
