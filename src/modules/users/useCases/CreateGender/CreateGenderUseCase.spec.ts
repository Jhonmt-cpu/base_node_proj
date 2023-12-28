import { DatabaseInMemory } from "@modules/users/repositories/inMemory/DatabaseInMemory";
import { GenderRepositoryInMemory } from "@modules/users/repositories/inMemory/GenderRepositoryInMemory";
import { CreateGenderUseCase } from "./CreateGenderUseCase";
import { AppError } from "@shared/errors/AppError";

let databaseInMemory: DatabaseInMemory;

let genderRepository: GenderRepositoryInMemory;

let createGenderUseCase: CreateGenderUseCase;

describe("Create Gender", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    genderRepository = new GenderRepositoryInMemory(databaseInMemory);

    createGenderUseCase = new CreateGenderUseCase(genderRepository);
  });

  it("Should be able to create a new gender", async () => {
    const gender = await createGenderUseCase.execute({
      gender_name: "gender_test",
    });

    expect(gender).toHaveProperty("gender_id");
    expect(gender.gender_name).toEqual("gender_test");
  });

  it("Should not be able to create a gender if name already exists", async () => {
    const gender = await genderRepository.create({
      gender_name: "gender_test",
    });

    await expect(
      createGenderUseCase.execute({
        gender_name: gender.gender_name,
      }),
    ).rejects.toEqual(new AppError("Gender already exists!"));
  });
});
