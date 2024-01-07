import { v4 as uuid } from "uuid";

import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";
import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";

import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { SynchronizeCacheUseCase } from "./SynchronizeCacheUseCase";
import auth from "@config/auth";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let dataBaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let refreshTokenRepository: RefreshTokenRepositoryInMemory;

let synchronizeCacheUseCase: SynchronizeCacheUseCase;

describe("SynchronizeCacheUseCase", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    dataBaseInMemory = new DatabaseInMemory();
    roleRepositoryInMemory = new RoleRepositoryInMemory(dataBaseInMemory);
    userRepositoryInMemory = new UserRepositoryInMemory(dataBaseInMemory);
    refreshTokenRepository = new RefreshTokenRepositoryInMemory(
      dataBaseInMemory,
    );

    synchronizeCacheUseCase = new SynchronizeCacheUseCase(
      dateProvider,
      cacheProvider,
      refreshTokenRepository,
    );
  });

  it("should be able to synchronize cache", async () => {
    const role = await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const user = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    });

    const user2 = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    });

    const user3 = await userRepositoryInMemory.create({
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    });

    const refresh_token_valid = await refreshTokenRepository.create({
      refresh_token_user_id: user.user_id,
      refresh_token_expires_in: dateProvider.addDays(30),
    });

    const refresh_token_second_valid = await refreshTokenRepository.create({
      refresh_token_user_id: user2.user_id,
      refresh_token_expires_in: dateProvider.addDays(30),
    });

    const refresh_token_expired = await refreshTokenRepository.create({
      refresh_token_user_id: user3.user_id,
      refresh_token_expires_in: dateProvider.addDays(-30),
    });

    const old_token_in_cache = uuid();

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refresh_token_valid.refresh_token_id}`,
      value: JSON.stringify({
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: role.role_name,
      }),
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refresh_token_second_valid.refresh_token_id}`,
      value: JSON.stringify({
        user_id: user2.user_id,
        user_name: user2.user_name,
        user_role: role.role_name,
      }),
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${old_token_in_cache}`,
      value: JSON.stringify({
        user_id: user.user_id,
        user_name: user3.user_name,
        user_role: role.role_name,
      }),
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    await synchronizeCacheUseCase.execute();

    const tokenCacheValid = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refresh_token_valid.refresh_token_id}`,
    );

    const tokenCacheSecondValid = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refresh_token_second_valid.refresh_token_id}`,
    );

    const tokenCacheExpired = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refresh_token_expired.refresh_token_id}`,
    );

    const oldTokenInCache = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${old_token_in_cache}`,
    );

    const tokenExpiredDeleted = await refreshTokenRepository.findById(
      refresh_token_expired.refresh_token_id,
    );

    expect(tokenCacheValid).toBe(
      JSON.stringify({
        user_id: user.user_id,
        user_name: user.user_name,
        user_role: role.role_name,
      }),
    );
    expect(tokenCacheSecondValid).toBe(
      JSON.stringify({
        user_id: user2.user_id,
        user_name: user2.user_name,
        user_role: role.role_name,
      }),
    );
    expect(tokenCacheExpired).toBeNull();
    expect(oldTokenInCache).toBeNull();
    expect(tokenExpiredDeleted).toBeUndefined();
  });
});
