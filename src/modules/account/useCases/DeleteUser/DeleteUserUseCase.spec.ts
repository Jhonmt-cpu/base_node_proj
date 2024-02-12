import auth from "@config/auth";
import { cachePrefixes } from "@config/cache";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";
import { AddressRepositoryInMemory } from "@modules/account/repositories/inMemory/AddressRepositoryInMemory";
import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryHashProvider } from "@shared/container/providers/HashProvider/implementations/InMemoryHashProvider";

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

  it("should be able to delete a user with an admin request and erase cache", async () => {
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
      key: `${cachePrefixes.refreshToken}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify({
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: "Role user",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    const cacheGetUserKey = `${cachePrefixes.getUser}:${user.user_id}`;

    const cacheGetUserAddressKey = `${cachePrefixes.getUserAddress}:${user.user_id}`;

    const cacheGetUserPhoneKey = `${cachePrefixes.getUserPhone}:${user.user_id}`;

    const cacheGetUserCompleteKey = `${cachePrefixes.getUserComplete}:${user.user_id}`;

    const cacheListAllUsersPaginatedKey = `${cachePrefixes.listAllUsersPaginated}`;

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserKey,
      value: JSON.stringify(user),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserAddressKey,
      value: JSON.stringify(userAddress),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserPhoneKey,
      value: JSON.stringify(userPhone),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserCompleteKey,
      value: JSON.stringify({
        user: user,
        address: userAddress,
        phone: userPhone,
      }),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheListAllUsersPaginatedKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheGetUserBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserKey,
    );

    const cacheGetUserAddressBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserAddressKey,
    );

    const cacheGetUserPhoneBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserPhoneKey,
    );

    const cacheGetUserCompleteBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserCompleteKey,
    );

    const cacheListAllUsersPaginatedBefore =
      await cacheProviderInMemory.cacheGet(cacheListAllUsersPaginatedKey);

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
      `${cachePrefixes.refreshToken}:${refreshToken.refresh_token_id}`,
    );
    const userPhoneDeleted = await phoneRepositoryInMemory.findById(
      userPhone.user_phone_id,
    );
    const userAddressDeleted = await addressRepositoryInMemory.findById(
      userAddress.user_address_id,
    );
    const cacheGetUserAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserKey,
    );
    const cacheGetUserAddressAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserAddressKey,
    );
    const cacheGetUserPhoneAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserPhoneKey,
    );
    const cacheGetUserCompleteAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserCompleteKey,
    );
    const cacheListAllUsersPaginatedAfter =
      await cacheProviderInMemory.cacheGet(cacheListAllUsersPaginatedKey);

    expect(userDeleted).toBeUndefined();
    expect(tokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
    expect(cacheGetUserBefore).not.toBeNull();
    expect(cacheGetUserAfter).toBeNull();
    expect(cacheGetUserAddressBefore).not.toBeNull();
    expect(cacheGetUserAddressAfter).toBeNull();
    expect(cacheGetUserPhoneBefore).not.toBeNull();
    expect(cacheGetUserPhoneAfter).toBeNull();
    expect(cacheGetUserCompleteBefore).not.toBeNull();
    expect(cacheGetUserCompleteAfter).toBeNull();
    expect(cacheListAllUsersPaginatedBefore).not.toBeNull();
    expect(cacheListAllUsersPaginatedAfter).toBeNull();
  });

  it("should be able to delete a user with password and erase cache", async () => {
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
      key: `${cachePrefixes.refreshToken}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify({
        user_id: userResponse.user_id,
        user_name: user.user_name,
        user_role: "Role user",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    const cacheGetUserKey = `${cachePrefixes.getUser}:${userResponse.user_id}`;

    const cacheGetUserAddressKey = `${cachePrefixes.getUserAddress}:${userResponse.user_id}`;

    const cacheGetUserPhoneKey = `${cachePrefixes.getUserPhone}:${userResponse.user_id}`;

    const cacheGetUserCompleteKey = `${cachePrefixes.getUserComplete}:${userResponse.user_id}`;

    const cacheListAllUsersPaginatedKey = `${cachePrefixes.listAllUsersPaginated}`;

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserKey,
      value: JSON.stringify(user),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserAddressKey,
      value: JSON.stringify(userAddress),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserPhoneKey,
      value: JSON.stringify(userPhone),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheGetUserCompleteKey,
      value: JSON.stringify({
        user: user,
        address: userAddress,
        phone: userPhone,
      }),
      expiresInSeconds: 60 * 60,
    });

    await cacheProviderInMemory.cacheSet({
      key: cacheListAllUsersPaginatedKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheGetUserBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserKey,
    );

    const cacheGetUserAddressBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserAddressKey,
    );

    const cacheGetUserPhoneBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserPhoneKey,
    );

    const cacheGetUserCompleteBefore = await cacheProviderInMemory.cacheGet(
      cacheGetUserCompleteKey,
    );

    const cacheListAllUsersPaginatedBefore =
      await cacheProviderInMemory.cacheGet(cacheListAllUsersPaginatedKey);

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
      `${cachePrefixes.refreshToken}:${refreshToken.refresh_token_id}`,
    );
    const userPhoneDeleted = await phoneRepositoryInMemory.findById(
      userPhone.user_phone_id,
    );
    const userAddressDeleted = await addressRepositoryInMemory.findById(
      userAddress.user_address_id,
    );
    const cacheGetUserAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserKey,
    );
    const cacheGetUserAddressAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserAddressKey,
    );
    const cacheGetUserPhoneAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserPhoneKey,
    );
    const cacheGetUserCompleteAfter = await cacheProviderInMemory.cacheGet(
      cacheGetUserCompleteKey,
    );
    const cacheListAllUsersPaginatedAfter =
      await cacheProviderInMemory.cacheGet(cacheListAllUsersPaginatedKey);

    expect(userDeleted).toBeUndefined();
    expect(tokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
    expect(cacheGetUserBefore).not.toBeNull();
    expect(cacheGetUserAfter).toBeNull();
    expect(cacheGetUserAddressBefore).not.toBeNull();
    expect(cacheGetUserAddressAfter).toBeNull();
    expect(cacheGetUserPhoneBefore).not.toBeNull();
    expect(cacheGetUserPhoneAfter).toBeNull();
    expect(cacheGetUserCompleteBefore).not.toBeNull();
    expect(cacheGetUserCompleteAfter).toBeNull();
    expect(cacheListAllUsersPaginatedBefore).not.toBeNull();
    expect(cacheListAllUsersPaginatedAfter).toBeNull();
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
