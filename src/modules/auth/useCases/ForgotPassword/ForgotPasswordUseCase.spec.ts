import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { ResetTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/ResetTokenRepositoryInMemory";

import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryMailProvider } from "@shared/container/providers/MailProvider/inMemory/InMemoryMailProvider";
import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { ForgotPasswordUseCase } from "./ForgotPasswordUseCase";
import auth from "@config/auth";

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let resetTokenRepositoryInMemory: ResetTokenRepositoryInMemory;

let dateProvider: DayjsDateProvider;

let mailProvider: InMemoryMailProvider;

let forgotPasswordUseCase: ForgotPasswordUseCase;

describe("Forgot Password Use Case", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);
    resetTokenRepositoryInMemory = new ResetTokenRepositoryInMemory(
      databaseInMemory,
    );
    dateProvider = new DayjsDateProvider();
    mailProvider = new InMemoryMailProvider();

    forgotPasswordUseCase = new ForgotPasswordUseCase(
      userRepositoryInMemory,
      resetTokenRepositoryInMemory,
      dateProvider,
      mailProvider,
    );
  });

  it("should be able to send a forgot password email", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "test@email.com",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
    });

    const oldToken = await resetTokenRepositoryInMemory.create({
      reset_token_user_id: user.user_id,
      reset_token_expires_in: dateProvider.addMinutes(
        Number(auth.forgotPassword.expiresInMinutes),
      ),
    });

    const sendMailSpy = jest.spyOn(mailProvider, "sendMail");

    const generateTokenSpy = jest.spyOn(resetTokenRepositoryInMemory, "create");

    await forgotPasswordUseCase.execute({ user_email: user.user_email });

    const tokenDeleted = await resetTokenRepositoryInMemory.findById(
      oldToken.reset_token_id,
    );

    expect(sendMailSpy).toHaveBeenCalled();
    expect(generateTokenSpy).toHaveBeenCalled();
    expect(tokenDeleted).toBeUndefined();
  });

  it("should not be able to send a forgot password email if user does not exists", async () => {
    const sendMailSpy = jest.spyOn(mailProvider, "sendMail");

    await forgotPasswordUseCase.execute({
      user_email: "nonexistinguser@email.com",
    });

    expect(sendMailSpy).not.toHaveBeenCalled();
  });
});
