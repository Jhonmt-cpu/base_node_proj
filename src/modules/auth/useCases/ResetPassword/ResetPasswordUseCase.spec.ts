import auth from "@config/auth";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { ResetTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/ResetTokenRepositoryInMemory";

import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryHashProvider } from "@shared/container/providers/HashProvider/inMemory/InMemoryHashProvider";
import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import { ResetPasswordUseCase } from "./ResetPasswordUseCase";

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let resetTokenRepositoryInMemory: ResetTokenRepositoryInMemory;

let dateProvider: DayjsDateProvider;

let hashProvider: InMemoryHashProvider;

let resetPasswordUseCase: ResetPasswordUseCase;

describe("Reset Password Use Case", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);
    resetTokenRepositoryInMemory = new ResetTokenRepositoryInMemory(
      databaseInMemory,
    );
    dateProvider = new DayjsDateProvider();
    hashProvider = new InMemoryHashProvider();

    resetPasswordUseCase = new ResetPasswordUseCase(
      userRepositoryInMemory,
      resetTokenRepositoryInMemory,
      dateProvider,
      hashProvider,
    );
  });

  it("should be able to reset password", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "test@email.com",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
    });

    const token = await resetTokenRepositoryInMemory.create({
      reset_token_user_id: user.user_id,
      reset_token_expires_in: dateProvider.addMinutes(
        Number(auth.forgotPassword.expiresInMinutes),
      ),
    });

    const newPassword = "new_password";

    await resetPasswordUseCase.execute({
      reset_token: token.reset_token_id,
      new_password: newPassword,
    });

    const tokenAfterUse = await resetTokenRepositoryInMemory.findById(
      token.reset_token_id,
    );

    const updatedUser = await userRepositoryInMemory.findById(user.user_id);

    if (!updatedUser) {
      throw new Error("User not found");
    }

    expect(updatedUser.user_password).toBe(newPassword);
    expect(tokenAfterUse).toBeUndefined();
  });

  it("should not be able to reset password with invalid token", async () => {
    await expect(
      resetPasswordUseCase.execute({
        reset_token: "invalid_token",
        new_password: "new_password",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.RESET_TOKEN_INVALID));
  });

  it("should not be able to reset password with expired token", async () => {
    const token = await resetTokenRepositoryInMemory.create({
      reset_token_user_id: 1,
      reset_token_expires_in: dateProvider.addMinutes(-10),
    });

    await expect(
      resetPasswordUseCase.execute({
        reset_token: token.reset_token_id,
        new_password: "new_password",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.RESET_TOKEN_EXPIRED));
  });

  it("should not be able to reset password if user does not exists", async () => {
    const token = await resetTokenRepositoryInMemory.create({
      reset_token_user_id: 999,
      reset_token_expires_in: dateProvider.addMinutes(
        Number(auth.forgotPassword.expiresInMinutes),
      ),
    });

    await expect(
      resetPasswordUseCase.execute({
        reset_token: token.reset_token_id,
        new_password: "new_password",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });
});
