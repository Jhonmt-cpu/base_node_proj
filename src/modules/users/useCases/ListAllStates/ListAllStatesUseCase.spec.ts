import { StateRepositoryInMemory } from "@modules/users/repositories/inMemory/StateRepositoryInMemory";
import { ListAllStatesUseCase } from "./ListAllStatesUseCase";

let stateRepositoryInMemory: StateRepositoryInMemory;

let listAllStatesUseCase: ListAllStatesUseCase;

describe("ListAllStatesUseCase", () => {
  beforeEach(() => {
    stateRepositoryInMemory = new StateRepositoryInMemory();

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
