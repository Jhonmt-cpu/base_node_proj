import { cachePrefixes } from "@config/cache";

import { PhoneRepositoryInMemory } from "@modules/account/repositories/inMemory/PhoneRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { AppError } from "@shared/errors/AppError";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { GetUserPhoneUseCase } from "./GetUserPhoneUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let phoneRepositoryInMemory: PhoneRepositoryInMemory;

let getUserPhoneUseCase: GetUserPhoneUseCase;

describe("GetUserPhoneUseCase", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);
    phoneRepositoryInMemory = new PhoneRepositoryInMemory(databaseInMemory);

    getUserPhoneUseCase = new GetUserPhoneUseCase(
      cacheProvider,
      phoneRepositoryInMemory,
    );
  });

  it("should be able to get a user phone and create cache", async () => {
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

    const cacheKey = `${cachePrefixes.getUserPhone}:${user.user_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const phone = await getUserPhoneUseCase.execute({
      user_id: user.user_id,
    });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(phone).toHaveProperty("user_phone_id");
    expect(phone.user_phone_id).toEqual(user.user_id);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
  });

  it("should be able to get a user phone from cache", async () => {
    const user = await userRepositoryInMemory.create({
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_password: "123456",
      user_cpf: 12345678911,
      user_gender_id: 1,
      user_birth_date: new Date("2005-01-01"),
    });

    await phoneRepositoryInMemory.create({
      user_phone_id: user.user_id,
      phone_number: 12345678911,
      phone_ddd: 11,
    });

    const firstResponse = await getUserPhoneUseCase.execute({
      user_id: user.user_id,
    });

    const spyCache = jest.spyOn(cacheProvider, "cacheGet");

    const cacheKey = `${cachePrefixes.getUserPhone}:${user.user_id}`;

    const secondResponse = await getUserPhoneUseCase.execute({
      user_id: user.user_id,
    });

    const returnedCacheFromSpy = await spyCache.mock.results[0].value;

    expect(JSON.stringify(firstResponse)).toBe(JSON.stringify(secondResponse));
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(returnedCacheFromSpy).toBe(JSON.stringify(firstResponse));
  });

  it("should not be able to get a user phone if it does not exists", async () => {
    await expect(
      getUserPhoneUseCase.execute({
        user_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_PHONE_NOT_FOUND, 404));
  });
});
