import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { InMemoryHashProvider } from "@shared/container/providers/HashProvider/implementations/InMemoryHashProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { JWTGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/implementations/JWTGenerateTokenProvider";
import { CryptoEncryptAndDecryptProvider } from "@modules/auth/container/providers/EncryptAndDecryptProvider/implementations/CryptoEncryptAndDecryptProvider";
import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";
import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import { AppError } from "@shared/errors/AppError";

import { LoginUseCase } from "./LoginUseCase";

let hashProvider: InMemoryHashProvider;

let dateProvider: DayjsDateProvider;

let inMemoryCacheProvider: InMemoryCacheProvider;

let encryptAndDecryptProvider: CryptoEncryptAndDecryptProvider;

let generateTokenProvider: JWTGenerateTokenProvider;

let dataBaseInMemory: DatabaseInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let refreshTokenRepositoryInMemory: RefreshTokenRepositoryInMemory;

let loginUseCase: LoginUseCase;

describe("LoginUseCase", () => {
  beforeEach(() => {
    hashProvider = new InMemoryHashProvider();
    dateProvider = new DayjsDateProvider();
    inMemoryCacheProvider = new InMemoryCacheProvider(dateProvider);
    encryptAndDecryptProvider = new CryptoEncryptAndDecryptProvider();
    generateTokenProvider = new JWTGenerateTokenProvider(
      encryptAndDecryptProvider,
    );
    dataBaseInMemory = new DatabaseInMemory();
    roleRepositoryInMemory = new RoleRepositoryInMemory(dataBaseInMemory);
    userRepositoryInMemory = new UserRepositoryInMemory(dataBaseInMemory);
    refreshTokenRepositoryInMemory = new RefreshTokenRepositoryInMemory(
      dataBaseInMemory,
    );

    loginUseCase = new LoginUseCase(
      hashProvider,
      generateTokenProvider,
      inMemoryCacheProvider,
      dateProvider,
      userRepositoryInMemory,
      refreshTokenRepositoryInMemory,
    );
  });

  it("should be able to login", async () => {
    const role = await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const result = await loginUseCase.execute({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const tokenDatabaseSaved = await refreshTokenRepositoryInMemory.findById(
      result.refresh_token,
    );

    const tokenCacheSaved = await inMemoryCacheProvider.cacheGet(
      `refresh_token:${result.refresh_token}`,
    );

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("refresh_token");
    expect(result).toHaveProperty("user");
    expect(tokenCacheSaved).toBe(
      JSON.stringify({
        user_id: userResponse.user_id,
        user_name: user.user_name,
        user_role: role.role_name,
      }),
    );
    expect(tokenDatabaseSaved).toHaveProperty("refresh_token_id");
  });

  it("should not be able to login with invalid email", async () => {
    await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    };

    await userRepositoryInMemory.create(user);

    await expect(
      loginUseCase.execute({
        user_email: "invalid_email",
        user_password: user.user_password,
      }),
    ).rejects.toEqual(new AppError("Incorrect email or password"));
  });

  it("should not be able to login with invalid password", async () => {
    await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    };

    await userRepositoryInMemory.create(user);

    await expect(
      loginUseCase.execute({
        user_email: user.user_email,
        user_password: "invalid_password",
      }),
    ).rejects.toEqual(new AppError("Incorrect email or password"));
  });

  it("should remove old refresh tokens when login", async () => {
    const role = await roleRepositoryInMemory.create({
      role_name: "role_test",
    });

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_password: "123456",
      user_birth_date: new Date("2005-01-01"),
      user_cpf: 12345678910,
      user_gender_id: 1,
    };

    const userResponse = await userRepositoryInMemory.create(user);

    const result1 = await loginUseCase.execute({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const result2 = await loginUseCase.execute({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const tokenDatabaseSaved1 = await refreshTokenRepositoryInMemory.findById(
      result1.refresh_token,
    );

    const tokenCacheSaved1 = await inMemoryCacheProvider.cacheGet(
      `refresh_token:${result1.refresh_token}`,
    );

    const tokenDatabaseSaved2 = await refreshTokenRepositoryInMemory.findById(
      result2.refresh_token,
    );

    const tokenCacheSaved2 = await inMemoryCacheProvider.cacheGet(
      `refresh_token:${result2.refresh_token}`,
    );

    expect(result2).toHaveProperty("token");
    expect(result2).toHaveProperty("refresh_token");
    expect(result2).toHaveProperty("user");
    expect(tokenCacheSaved1).toBeNull();
    expect(tokenCacheSaved2).toBe(
      JSON.stringify({
        user_id: userResponse.user_id,
        user_name: user.user_name,
        user_role: role.role_name,
      }),
    );
    expect(tokenDatabaseSaved1).toBeUndefined();
    expect(tokenDatabaseSaved2).toHaveProperty("refresh_token_id");
  });
});
