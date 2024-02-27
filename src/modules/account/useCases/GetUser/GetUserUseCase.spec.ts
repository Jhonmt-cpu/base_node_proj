import { cachePrefixes } from "@config/cache";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/inMemory/InMemoryCacheProvider";

import { GetUserUseCase } from "./GetUserUseCase";

let dateProvider: DayjsDateProvider;

let cacheProviderInMemory: InMemoryCacheProvider;

let databaseInMemory: DatabaseInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let getUserUseCase: GetUserUseCase;

describe("Get User", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProviderInMemory = new InMemoryCacheProvider(dateProvider);
    databaseInMemory = new DatabaseInMemory();
    userRepositoryInMemory = new UserRepositoryInMemory(databaseInMemory);

    getUserUseCase = new GetUserUseCase(
      cacheProviderInMemory,
      userRepositoryInMemory,
    );
  });

  it("should be able to get an user an create cache", async () => {
    const userCreated = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "user_test@test.com",
      user_password: "1234",
      user_cpf: 123456789,
      user_gender_id: 1,
      user_birth_date: new Date("2005-01-01"),
    });

    const cacheKey = `${cachePrefixes.getUser}:${userCreated.user_id}`;

    const cacheValueBefore = await cacheProviderInMemory.cacheGet(cacheKey);

    const user = await getUserUseCase.execute({
      user_id: userCreated.user_id,
    });

    const cacheValueAfter = await cacheProviderInMemory.cacheGet(cacheKey);

    expect(user.user_id).toEqual(userCreated.user_id);
    expect(user.user_name).toEqual(userCreated.user_name);
    expect(user.user_email).toEqual(userCreated.user_email);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toBe(JSON.stringify(user));
  });

  it("should be able to get an user from cache", async () => {
    const userCreated = await userRepositoryInMemory.create({
      user_name: "User Test 2",
      user_email: "user_test2@test.com",
      user_password: "1234",
      user_cpf: 123456780,
      user_gender_id: 1,
      user_birth_date: new Date("2005-01-01"),
    });

    const firstResponse = await getUserUseCase.execute({
      user_id: userCreated.user_id,
    });

    const spyCache = jest.spyOn(cacheProviderInMemory, "cacheGet");

    const cacheKey = `${cachePrefixes.getUser}:${userCreated.user_id}`;

    const secondResponse = await getUserUseCase.execute({
      user_id: userCreated.user_id,
    });

    const returnedCacheFromSpy = await spyCache.mock.results[0].value;

    expect(JSON.stringify(firstResponse)).toBe(JSON.stringify(secondResponse));
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(returnedCacheFromSpy).toBe(JSON.stringify(firstResponse));
  });

  it("should not be able to get an user with invalid id", async () => {
    await expect(
      getUserUseCase.execute({
        user_id: 1,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });
});
