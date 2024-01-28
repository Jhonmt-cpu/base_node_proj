import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";

import { ListAllGendersUseCase } from "./ListAllGendersUseCase";

let databaseInMemory: DatabaseInMemory;

let genderRepositoryInMemory: GenderRepositoryInMemory;

let listAllGendersUseCase: ListAllGendersUseCase;

describe("List All Genders", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    genderRepositoryInMemory = new GenderRepositoryInMemory(databaseInMemory);

    listAllGendersUseCase = new ListAllGendersUseCase(genderRepositoryInMemory);
  });

  it("should be able to list all genders", async () => {
    const gender = await genderRepositoryInMemory.create({
      gender_name: "gender_test",
    });

    const genders = await listAllGendersUseCase.execute();

    expect(genders).toEqual([gender]);
  });
});
