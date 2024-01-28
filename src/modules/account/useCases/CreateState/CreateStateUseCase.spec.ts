import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { StateRepositoryInMemory } from "@modules/account/repositories/inMemory/StateRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import { CreateStateUseCase } from "./CreateStateUseCase";

let databaseInMemory: DatabaseInMemory;

let stateRepository: StateRepositoryInMemory;

let createStateUseCase: CreateStateUseCase;

describe("Create State", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    stateRepository = new StateRepositoryInMemory(databaseInMemory);

    createStateUseCase = new CreateStateUseCase(stateRepository);
  });

  it("should be able to create a new state", async () => {
    const state = await createStateUseCase.execute({
      state_name: "state_test",
      state_uf: "ST",
    });

    expect(state).toHaveProperty("state_id");
    expect(state.state_name).toEqual("state_test");
    expect(state.state_uf).toEqual("ST");
  });

  it("should not be able to create a new state with same name and uf", async () => {
    await stateRepository.create({
      state_name: "state_test",
      state_uf: "ST",
    });

    await expect(
      createStateUseCase.execute({
        state_name: "state_test",
        state_uf: "ST",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.STATE_ALREADY_EXISTS));
  });
});
