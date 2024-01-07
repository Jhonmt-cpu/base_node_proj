import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";

import { ListAllGendersPaginatedUseCase } from "./ListAllGendersPaginatedUseCase";

let databaseInMemory: DatabaseInMemory;

let listAllGendersPaginatedUseCase: ListAllGendersPaginatedUseCase;

let genderRepositoryInMemory: GenderRepositoryInMemory;

describe("List All Genders Paginated", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    genderRepositoryInMemory = new GenderRepositoryInMemory(databaseInMemory);

    listAllGendersPaginatedUseCase = new ListAllGendersPaginatedUseCase(
      genderRepositoryInMemory,
    );
  });

  it("should be able to list all genders", async () => {
    const role = await genderRepositoryInMemory.create({
      gender_name: "gender_test",
    });

    const roles = await listAllGendersPaginatedUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(roles).toEqual([role]);
  });

  it("should be able to list all genders with pagination", async () => {
    for (let i = 0; i < 20; i++) {
      await genderRepositoryInMemory.create({
        gender_name: `gender_test_${i}`,
      });
    }

    const genders10 = await listAllGendersPaginatedUseCase.execute({
      page: 1,
      limit: 10,
    });
    const genders5 = await listAllGendersPaginatedUseCase.execute({
      page: 4,
      limit: 5,
    });
    const genders30 = await listAllGendersPaginatedUseCase.execute({
      page: 1,
      limit: 30,
    });

    expect(genders10.length).toEqual(10);
    expect(genders5.length).toEqual(5);
    expect(genders30.length).toEqual(20);
    expect(genders30[0].gender_name).toEqual("gender_test_0");
    expect(genders5[0].gender_name).toEqual("gender_test_15");
  });
});
