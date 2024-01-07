import { v4 as uuid } from "uuid";

import { CryptoEncryptAndDecryptProvider } from "@modules/auth/container/providers/EncryptAndDecryptProvider/implementations/CryptoEncryptAndDecryptProvider";
import { JWTGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/implementations/JWTGenerateTokenProvider";
import { InMemoryCacheProvider } from "@shared/container/providers/CacheProvider/implementations/InMemoryCacheProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

import auth from "@config/auth";

import { AppError } from "@shared/errors/AppError";

import { RefreshTokenUseCase } from "./RefreshTokenUseCase";

let dateProvider: DayjsDateProvider;

let cacheProvider: InMemoryCacheProvider;

let encryptAndDecryptProvider: CryptoEncryptAndDecryptProvider;

let generateTokenProvider: JWTGenerateTokenProvider;

let refreshTokenUseCase: RefreshTokenUseCase;

describe("RefreshTokenUseCase", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    cacheProvider = new InMemoryCacheProvider(dateProvider);
    encryptAndDecryptProvider = new CryptoEncryptAndDecryptProvider();
    generateTokenProvider = new JWTGenerateTokenProvider(
      encryptAndDecryptProvider,
    );

    refreshTokenUseCase = new RefreshTokenUseCase(
      cacheProvider,
      generateTokenProvider,
    );
  });

  it("should be able to refresh token", async () => {
    const userData = {
      user_id: 1,
      user_name: "John Doe",
      user_role: "role_test",
    };

    const refreshToken = uuid();

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refreshToken}`,
      value: JSON.stringify(userData),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

    const token = await refreshTokenUseCase.execute({
      refresh_token: refreshToken,
    });

    expect(token).toHaveProperty("token");
  });

  it("should not be able to refresh token if not found", async () => {
    await expect(
      refreshTokenUseCase.execute({
        refresh_token: uuid(),
      }),
    ).rejects.toEqual(new AppError("Refresh token not found", 404));
  });
});
