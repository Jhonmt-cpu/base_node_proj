import { GenderRepositoryInMemory } from "@modules/users/repositories/inMemory/GenderRepositoryInMemory";
import { ListAllGendersUseCase } from "./ListAllGendersUseCase";

let genderRepositoryInMemory: GenderRepositoryInMemory;

let listAllGendersUseCase: ListAllGendersUseCase;

describe("List All Genders", () => {
  beforeEach(() => {
    genderRepositoryInMemory = new GenderRepositoryInMemory();

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
