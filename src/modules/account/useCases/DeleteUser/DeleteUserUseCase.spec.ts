import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";
import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";
import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryHashProvider } from "@shared/container/providers/HashProvider/implementations/InMemoryHashProvider";

import auth from "@config/auth";

import { DeleteUserUseCase } from "./DeleteUserUseCase";

let hashProvider: InMemoryHashProvider;

let dateProvider: DayjsDateProvider;

let cacheProviderInMemory: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let refreshTokenRepositoryInMemory: RefreshTokenRepositoryInMemory;

let addressRepositoryInMemory: AddressRepositoryInMemory;

let phoneRepositoryInMemory: PhoneRepositoryInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let deleteUserUseCase: DeleteUserUseCase;

describe("DeleteUserUseCase", () => {
  beforeEach(() => {
    hashProvider = new InMemoryHashProvider();
    dateProvider = new DayjsDateProvider();
    cacheProviderInMemory = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    refreshTokenRepositoryInMemory = new RefreshTokenRepositoryInMemory(
      databaseInMemory,
    );
    addressRepositoryInMemory = new AddressRepositoryInMemory(databaseInMemory);
    phoneRepositoryInMemory = new PhoneRepositoryInMemory(databaseInMemory);
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    deleteUserUseCase = new DeleteUserUseCase(
      hashProvider,
      cacheProviderInMemory,
      refreshTokenRepositoryInMemory,
      userRepositoryInMemory,
    );
  });

  it("should be able to delete a user with an admin request", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_birth_date: new Date(),
      user_cpf: 12345678910,
      user_gender_id: 1,
      user_password: "123456",
    });

    const userPhone = await phoneRepositoryInMemory.create({
      user_phone_id: user.user_id,
      phone_number: 12345678910,
      phone_ddd: 34,
    });

    const userAddress = await addressRepositoryInMemory.create({
      user_address_id: user.user_id,
      address_street: "Street Test",
      address_number: 123,
      address_neighborhood_id: 1,
      address_zip_code: 12345678,
    });

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: user.user_id,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    await cacheProviderInMemory.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify({
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: "Role user",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    await deleteUserUseCase.execute({
      user_id: user.user_id,
      user_password: "",
      is_admin_request: true,
    });

    const userDeleted = await userRepositoryInMemory.findByIdWithoutPassword(
      user.user_id,
    );
    const tokensDeleted = await refreshTokenRepositoryInMemory.findAllByUserId(
      user.user_id,
    );
    const refreshTokenCacheDeleted = await cacheProviderInMemory.cacheGet(
      `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
    );
    const userPhoneDeleted = await phoneRepositoryInMemory.findById(
      userPhone.user_phone_id,
    );
    const userAddressDeleted = await addressRepositoryInMemory.findById(
      userAddress.user_address_id,
    );

    expect(userDeleted).toBeUndefined();
    expect(tokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
  });

  it("should be able to delete a user with password", async () => {
    const user = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_birth_date: new Date(),
      user_cpf: 10987654321,
      user_gender_id: 1,
      user_password: "123456",
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const userPhone = await phoneRepositoryInMemory.create({
      user_phone_id: userResponse.user_id,
      phone_number: 12345678910,
      phone_ddd: 34,
    });

    const userAddress = await addressRepositoryInMemory.create({
      user_address_id: userResponse.user_id,
      address_street: "Street Test",
      address_number: 123,
      address_neighborhood_id: 1,
      address_zip_code: 12345678,
    });

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: userResponse.user_id,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    await cacheProviderInMemory.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify({
        user_id: userResponse.user_id,
        user_name: user.user_name,
        user_role: "Role user",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    await deleteUserUseCase.execute({
      user_id: userResponse.user_id,
      user_password: user.user_password,
      is_admin_request: false,
    });

    const userDeleted = await userRepositoryInMemory.findByIdWithoutPassword(
      userResponse.user_id,
    );
    const tokensDeleted = await refreshTokenRepositoryInMemory.findAllByUserId(
      userResponse.user_id,
    );
    const refreshTokenCacheDeleted = await cacheProviderInMemory.cacheGet(
      `${auth.refresh.cachePrefix}:${refreshToken.refresh_token_id}`,
    );
    const userPhoneDeleted = await phoneRepositoryInMemory.findById(
      userPhone.user_phone_id,
    );
    const userAddressDeleted = await addressRepositoryInMemory.findById(
      userAddress.user_address_id,
    );

    expect(userDeleted).toBeUndefined();
    expect(tokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
  });

  it("should not be able to delete a user if it does not exists", async () => {
    await expect(
      deleteUserUseCase.execute({
        user_id: 1,
        user_password: "",
        is_admin_request: true,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });

  it("should not be able to delete a user if password is incorrect", async () => {
    const user = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_birth_date: new Date(),
      user_cpf: 10987654321,
      user_gender_id: 1,
      user_password: "123456",
    };

    const userResponse = await userRepositoryInMemory.create(user);

    await expect(
      deleteUserUseCase.execute({
        user_id: userResponse.user_id,
        user_password: "incorrect password",
        is_admin_request: false,
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.USER_INCORRECT_PASSWORD, 401),
    );
  });
});
