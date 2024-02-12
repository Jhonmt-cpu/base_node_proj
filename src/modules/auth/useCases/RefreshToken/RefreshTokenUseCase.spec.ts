import { v4 as uuid } from "uuid";

import { CryptoEncryptAndDecryptProvider } from "@modules/auth/container/providers/EncryptAndDecryptProvider/implementations/CryptoEncryptAndDecryptProvider";
import { JWTGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/implementations/JWTGenerateTokenProvider";
import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";

import auth from "@config/auth";
import { cachePrefixes } from "@config/cache";

import { AppError } from "@shared/errors/AppError";
import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import { RefreshTokenUseCase } from "./RefreshTokenUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let encryptAndDecryptProvider: CryptoEncryptAndDecryptProvider;

let generateTokenProvider: JWTGenerateTokenProvider;

let dataBaseInMemory: DatabaseInMemory;

let refreshTokenRepositoryInMemory: RefreshTokenRepositoryInMemory;

let refreshTokenUseCase: RefreshTokenUseCase;

describe("RefreshTokenUseCase", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    encryptAndDecryptProvider = new CryptoEncryptAndDecryptProvider();
    generateTokenProvider = new JWTGenerateTokenProvider(
      encryptAndDecryptProvider,
    );
    dataBaseInMemory = new DatabaseInMemory();
    refreshTokenRepositoryInMemory = new RefreshTokenRepositoryInMemory(
      dataBaseInMemory,
    );

    refreshTokenUseCase = new RefreshTokenUseCase(
      cacheProvider,
      generateTokenProvider,
      dateProvider,
      refreshTokenRepositoryInMemory,
    );
  });

  it("should be able to refresh token", async () => {
    const userData = {
      user_id: 1,
      user_name: "John Doe",
      user_role: "role_test",
    };

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: userData.user_id,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    await cacheProvider.cacheSet({
      key: `${cachePrefixes.refreshToken}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify(userData),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    const token = await refreshTokenUseCase.execute({
      refresh_token: refreshToken.refresh_token_id,
    });

    expect(token).toHaveProperty("token");
  });

  it("should not be able to refresh using same refresh token twice", async () => {
    const userData = {
      user_id: 1,
      user_name: "John Doe",
      user_role: "role_test",
    };

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: userData.user_id,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    await cacheProvider.cacheSet({
      key: `${cachePrefixes.refreshToken}:${refreshToken.refresh_token_id}`,
      value: JSON.stringify(userData),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    const firstRefresh = await refreshTokenUseCase.execute({
      refresh_token: refreshToken.refresh_token_id,
    });

    const secondRefresh = await refreshTokenUseCase.execute({
      refresh_token: firstRefresh.refresh_token,
    });

    expect(firstRefresh).toHaveProperty("token");
    expect(firstRefresh).toHaveProperty("refresh_token");
    expect(secondRefresh).toHaveProperty("token");
    expect(secondRefresh).toHaveProperty("refresh_token");
    await expect(
      refreshTokenUseCase.execute({
        refresh_token: refreshToken.refresh_token_id,
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.REFRESH_TOKEN_NOT_FOUND, 404),
    );
  });

  it("should not be able to refresh token if not found in cache", async () => {
    await expect(
      refreshTokenUseCase.execute({
        refresh_token: uuid(),
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.REFRESH_TOKEN_NOT_FOUND, 404),
    );
  });

  it("should not be able to refresh token if not found in database", async () => {
    const refresh_token = uuid();

    await cacheProvider.cacheSet({
      key: `${cachePrefixes.refreshToken}:${refresh_token}`,
      value: JSON.stringify({
        user_id: 1,
        user_name: "Test User",
        role_name: "Test Role",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    await expect(
      refreshTokenUseCase.execute({
        refresh_token,
      }),
    ).rejects.toEqual(
      new AppError(AppErrorMessages.REFRESH_TOKEN_INVALID, 400),
    );
  });
});
