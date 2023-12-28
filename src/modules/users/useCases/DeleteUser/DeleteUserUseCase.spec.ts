import { DatabaseInMemory } from "@modules/users/repositories/inMemory/DatabaseInMemory";
import { UserRepositoryInMemory } from "@modules/users/repositories/inMemory/UserRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";

import { DeleteUserUseCase } from "./DeleteUserUseCase";

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let deleteUserUseCase: DeleteUserUseCase;

describe("DeleteUserUseCase", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    deleteUserUseCase = new DeleteUserUseCase(userRepositoryInMemory);
  });

  it("should be able to delete a user", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_birth_date: new Date(),
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
    });

    await deleteUserUseCase.execute({ user_id: user.user_id });

    const userDeleted = await userRepositoryInMemory.findByIdWithoutPassword(
      user.user_id,
    );

    expect(userDeleted).toBeUndefined();
  });

  it("should not be able to delete a user if it does not exists", async () => {
    await expect(
      deleteUserUseCase.execute({
        user_id: 1,
      }),
    ).rejects.toEqual(new AppError("User not found", 404));
  });
});
