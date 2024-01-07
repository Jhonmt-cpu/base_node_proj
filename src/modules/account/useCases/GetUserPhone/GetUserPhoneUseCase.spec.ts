import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { GetUserPhoneUseCase } from "./GetUserPhoneUseCase";

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let phoneRepositoryInMemory: PhoneRepositoryInMemory;

let getUserPhoneUseCase: GetUserPhoneUseCase;

describe("GetUserPhoneUseCase", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);
    phoneRepositoryInMemory = new PhoneRepositoryInMemory(databaseInMemory);

    getUserPhoneUseCase = new GetUserPhoneUseCase(phoneRepositoryInMemory);
  });

  it("should be able to get a user phone", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_birth_date: new Date("2005-01-01"),
    });

    await phoneRepositoryInMemory.create({
      user_phone_id: user.user_id,
      phone_number: 12345678910,
      phone_ddd: 11,
    });

    const phone = await getUserPhoneUseCase.execute({
      user_id: user.user_id,
    });

    expect(phone).toHaveProperty("user_phone_id");
    expect(phone.user_phone_id).toEqual(user.user_id);
  });

  it("should not be able to get a user phone if it does not exists", async () => {
    await expect(
      getUserPhoneUseCase.execute({
        user_id: 1,
      }),
    ).rejects.toHaveProperty("message");
  });
});
