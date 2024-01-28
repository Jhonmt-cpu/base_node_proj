import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { GenderRepositoryInMemory } from "@modules/account/repositories/inMemory/GenderRepositoryInMemory";
import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";
import { NeighborHoodRepositoryInMemory } from "@modules/account/repositories/inMemory/NeighborhoodRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";
import { InMemoryHashProvider } from "@shared/container/providers/HashProvider/implementations/InMemoryHashProvider";

import { AppError } from "@shared/errors/AppError";

import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let databaseInMemory: DatabaseInMemory;

let hashProvider: InMemoryHashProvider;

let genderRepositoryInMemory: GenderRepositoryInMemory;

let phoneRepositoryInMemory: PhoneRepositoryInMemory;

let neighborhoodRepositoryInMemory: NeighborHoodRepositoryInMemory;

let addressRepositoryInMemory: AddressRepositoryInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let updateUserUseCase: UpdateUserUseCase;

describe("Update User", () => {
  beforeEach(() => {
    databaseInMemory = new DatabaseInMemory();
    hashProvider = new InMemoryHashProvider();
    genderRepositoryInMemory = new GenderRepositoryInMemory(databaseInMemory);
    phoneRepositoryInMemory = new PhoneRepositoryInMemory(databaseInMemory);
    neighborhoodRepositoryInMemory = new NeighborHoodRepositoryInMemory(
      databaseInMemory,
    );
    addressRepositoryInMemory = new AddressRepositoryInMemory(databaseInMemory);
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    updateUserUseCase = new UpdateUserUseCase(
      hashProvider,
      genderRepositoryInMemory,
      phoneRepositoryInMemory,
      neighborhoodRepositoryInMemory,
      addressRepositoryInMemory,
      userRepositoryInMemory,
    );
  });

  it("should be able to update user", async () => {
    const gender = await genderRepositoryInMemory.create({
      gender_name: "Gender Test",
    });

    const gender2 = await genderRepositoryInMemory.create({
      gender_name: "Gender Test 2",
    });

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: gender.gender_id,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const neighborhood = await neighborhoodRepositoryInMemory.create({
      neighborhood_name: "Neighborhood Test",
      neighborhood_city_id: 1,
    });

    const neighborhood2 = await neighborhoodRepositoryInMemory.create({
      neighborhood_name: "Neighborhood Test 2",
      neighborhood_city_id: 1,
    });

    await addressRepositoryInMemory.create({
      user_address_id: userResponse.user_id,
      address_street: "Street Test",
      address_number: 123,
      address_complement: "Complement Test",
      address_zip_code: 12345678,
      address_neighborhood_id: neighborhood.neighborhood_id,
    });

    await phoneRepositoryInMemory.create({
      user_phone_id: userResponse.user_id,
      phone_ddd: 11,
      phone_number: 123456789,
    });

    const userUpdate = {
      user_id: userResponse.user_id,
      user_password: user.user_password,
      user_name: "User Test Update",
      user_email: "usertestupdate@test.com",
      user_new_password: "1234567",
      user_gender_id: gender2.gender_id,
      user_phone: {
        phone_number: 987654321,
        phone_ddd: 12,
      },
      user_address: {
        address_street: "Street Test Update",
        address_number: 321,
        address_complement: "Complement Test Update",
        address_neighborhood_id: neighborhood2.neighborhood_id,
        address_zip_code: 87654321,
      },
    };

    const userUpdatedExpected = {
      user_id: userResponse.user_id,
      user_name: userUpdate.user_name,
      user_email: userUpdate.user_email,
      user_birth_date: userResponse.user_birth_date,
      user_gender_id: userUpdate.user_gender_id,
      user_phone: {
        user_phone_id: userResponse.user_id,
        phone_number: userUpdate.user_phone.phone_number,
        phone_ddd: userUpdate.user_phone.phone_ddd,
        phone_updated_at: expect.any(Date),
      },
      user_address: {
        user_address_id: userResponse.user_id,
        address_street: userUpdate.user_address.address_street,
        address_number: userUpdate.user_address.address_number,
        address_complement: userUpdate.user_address.address_complement,
        address_neighborhood_id:
          userUpdate.user_address.address_neighborhood_id,
        address_zip_code: userUpdate.user_address.address_zip_code,
        address_updated_at: expect.any(Date),
      },
      user_created_at: userResponse.user_created_at,
      user_updated_at: expect.any(Date),
    };

    const userUpdated = await updateUserUseCase.execute(userUpdate);

    const userAfterUpdate = await userRepositoryInMemory.findByEmail(
      userUpdate.user_email,
    );

    if (!userAfterUpdate) {
      throw new Error("User not found");
    }

    const passwordMatch = await hashProvider.compareHash(
      userUpdate.user_new_password,
      userAfterUpdate.user_password,
    );

    expect(userUpdated).toEqual(userUpdatedExpected);
    expect(passwordMatch).toBe(true);
  });

  it("should not be able to update a non existing user", async () => {
    await expect(
      updateUserUseCase.execute({
        user_id: 1,
        user_password: "123456",
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });

  it("should not be able to update an user with incorrect password", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    });

    await expect(
      updateUserUseCase.execute({
        user_id: user.user_id,
        user_password: "incorrect_password",
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.USER_INCORRECT_PASSWORD, 401),
    );
  });

  it("should not be able to update the user email if it already belongs to another user", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const user2 = await userRepositoryInMemory.create({
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_cpf: 12345678911,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    });

    await expect(
      updateUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: user.user_password,
        user_email: user2.user_email,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_EMAIL_ALREADY_IN_USE));
  });

  it("should not be able to update user gender if it does not exists", async () => {
    const gender = await genderRepositoryInMemory.create({
      gender_name: "Gender Test",
    });

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: gender.gender_id,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    await expect(
      updateUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: user.user_password,
        user_gender_id: gender.gender_id + 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.GENDER_NOT_FOUND));
  });

  it("should not be able to update user phone if it already belongs to another user", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    await phoneRepositoryInMemory.create({
      user_phone_id: userResponse.user_id,
      phone_ddd: 11,
      phone_number: 123456789,
    });

    const phone2 = await phoneRepositoryInMemory.create({
      user_phone_id: userResponse.user_id + 1,
      phone_ddd: 12,
      phone_number: 987654321,
    });

    await expect(
      updateUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: user.user_password,
        user_phone: {
          phone_ddd: phone2.phone_ddd,
          phone_number: phone2.phone_number,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_PHONE_ALREADY_IN_USE));
  });

  it("should not be able to update user phone if it doesn't exists", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    await expect(
      updateUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: user.user_password,
        user_phone: {
          phone_ddd: 11,
          phone_number: 123456789,
        },
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_PHONE_NOT_FOUND, 404));
  });

  it("should not be able to update user address if it doesn't exists", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    await expect(
      updateUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: user.user_password,
        user_address: {
          address_street: "Street Test",
        },
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.USER_ADDRESS_NOT_FOUND, 404),
    );
  });

  it("should not be able to update user address if neighborhood doesn't exists", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const address = await addressRepositoryInMemory.create({
      user_address_id: userResponse.user_id,
      address_street: "Street Test",
      address_number: 123,
      address_complement: "Complement Test",
      address_zip_code: 12345678,
      address_neighborhood_id: 1,
    });

    await expect(
      updateUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: user.user_password,
        user_address: {
          address_neighborhood_id: address.address_neighborhood_id + 1,
        },
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.NEIGHBORHOOD_NOT_FOUND, 404),
    );
  });

  it("should not update an user property if it is undefined or the same as the current name", async () => {
    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const address = await addressRepositoryInMemory.create({
      user_address_id: userResponse.user_id,
      address_street: "Street Test",
      address_number: 123,
      address_complement: "Complement Test",
      address_zip_code: 12345678,
      address_neighborhood_id: 1,
    });

    const phone = await phoneRepositoryInMemory.create({
      user_phone_id: userResponse.user_id,
      phone_ddd: 11,
      phone_number: 123456789,
    });

    const userBeforeUpdate = await userRepositoryInMemory.findById(
      userResponse.user_id,
    );
    const addressBeforeUpdate = await addressRepositoryInMemory.findById(
      userResponse.user_id,
    );
    const phoneBeforeUpdate = await phoneRepositoryInMemory.findById(
      userResponse.user_id,
    );

    const userUpdateSameData = {
      user_id: userResponse.user_id,
      user_password: user.user_password,
      user_name: user.user_name,
      user_email: user.user_email,
      user_gender_id: user.user_gender_id,
      user_phone: {
        phone_number: phone.phone_number,
        phone_ddd: phone.phone_ddd,
      },
      user_address: {
        address_street: address.address_street,
        address_number: address.address_number,
        address_complement: address.address_complement,
        address_neighborhood_id: address.address_neighborhood_id,
        address_zip_code: address.address_zip_code,
      },
    };

    const userUpdateUndefined = {
      user_id: userResponse.user_id,
      user_password: user.user_password,
    };

    const userUpdatedExpected = {
      user_id: userResponse.user_id,
    };

    const userUpdatedSameData = await updateUserUseCase.execute(
      userUpdateSameData,
    );

    const userAfterUpdateSameData = await userRepositoryInMemory.findById(
      userResponse.user_id,
    );
    const addressAfterUpdateSameData = await addressRepositoryInMemory.findById(
      userResponse.user_id,
    );
    const phoneAfterUpdateSameData = await phoneRepositoryInMemory.findById(
      userResponse.user_id,
    );

    const userUpdatedUndefined = await updateUserUseCase.execute(
      userUpdateUndefined,
    );

    const userAfterUpdateUndefined = await userRepositoryInMemory.findById(
      userResponse.user_id,
    );
    const addressAfterUpdateUndefined =
      await addressRepositoryInMemory.findById(userResponse.user_id);
    const phoneAfterUpdateUndefined = await phoneRepositoryInMemory.findById(
      userResponse.user_id,
    );

    expect(userUpdatedSameData).toEqual(userUpdatedExpected);
    expect(userAfterUpdateSameData).toEqual(userBeforeUpdate);
    expect(addressAfterUpdateSameData).toEqual(addressBeforeUpdate);
    expect(phoneAfterUpdateSameData).toEqual(phoneBeforeUpdate);
    expect(userUpdatedUndefined).toEqual(userUpdatedExpected);
    expect(userAfterUpdateUndefined).toEqual(userBeforeUpdate);
    expect(addressAfterUpdateUndefined).toEqual(addressBeforeUpdate);
    expect(phoneAfterUpdateUndefined).toEqual(phoneBeforeUpdate);
  });
});
