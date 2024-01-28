import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";

import { GetUserUseCase } from "./GetUserUseCase";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let getUserUseCase: GetUserUseCase;

describe("Get User", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    getUserUseCase = new GetUserUseCase(userRepositoryInMemory);
  });

  it("should be able to get an user", async () => {
    const userCreated = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "user_test@test.com",
      user_password: "1234",
      user_cpf: 123456789,
      user_gender_id: 1,
      user_birth_date: new Date("2005-01-01"),
    });

    const user = await getUserUseCase.execute({
      user_id: userCreated.user_id,
    });

    expect(user.user_id).toEqual(userCreated.user_id);
    expect(user.user_name).toEqual(userCreated.user_name);
    expect(user.user_email).toEqual(userCreated.user_email);
  });

  it("should not be able to get an user with invalid id", async () => {
    await expect(
      getUserUseCase.execute({
        user_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });
});
