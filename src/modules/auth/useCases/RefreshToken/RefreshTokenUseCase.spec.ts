import { CryptoEncryptAndDecryptProvider } from "@modules/auth/container/providers/EncryptAndDecryptProvider/implementations/CryptoEncryptAndDecryptProvider";
import { JWTGenerateTokenProvider } from "@modules/auth/container/providers/GenerateTokenProvider/implementations/JWTGenerateTokenProvider";
import { RefreshTokenRepositoryInMemory } from "@modules/auth/repositories/inMemory/RefreshTokenRepositoryInMemory";

import auth from "@config/auth";

import { AppError } from "@shared/errors/AppError";
import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import { RefreshTokenUseCase } from "./RefreshTokenUseCase";
import { UserRepositoryInMemory } from "@modules/account/repositories/inMemory/UserRepositoryInMemory";
import { RoleRepositoryInMemory } from "@modules/account/repositories/inMemory/RoleRepositoryInMemory";

let dateProvider: DayjsDateProvider;

let encryptAndDecryptProvider: CryptoEncryptAndDecryptProvider;

let generateTokenProvider: JWTGenerateTokenProvider;

let dataBaseInMemory: DatabaseInMemory;

let refreshTokenRepositoryInMemory: RefreshTokenRepositoryInMemory;

let roleRepositoryInMemory: RoleRepositoryInMemory;

let userRepositoryInMemory: UserRepositoryInMemory;

let refreshTokenUseCase: RefreshTokenUseCase;

describe("RefreshTokenUseCase", () => {
  beforeEach(() => {
    dateProvider = new DayjsDateProvider();
    encryptAndDecryptProvider = new CryptoEncryptAndDecryptProvider();
    generateTokenProvider = new JWTGenerateTokenProvider(
      encryptAndDecryptProvider,
    );
    dataBaseInMemory = new DatabaseInMemory();
    roleRepositoryInMemory = new RoleRepositoryInMemory(dataBaseInMemory);
    refreshTokenRepositoryInMemory = new RefreshTokenRepositoryInMemory(
      dataBaseInMemory,
    );
    userRepositoryInMemory = new UserRepositoryInMemory(dataBaseInMemory);

    refreshTokenUseCase = new RefreshTokenUseCase(
      generateTokenProvider,
      dateProvider,
      refreshTokenRepositoryInMemory,
      userRepositoryInMemory,
    );
  });

  it("should be able to refresh token", async () => {
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

    const userResponse = await userRepositoryInMemory.create(user);

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: userResponse.user_id,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    const tokenResponse = await refreshTokenUseCase.execute({
      refresh_token: refreshToken.refresh_token_id,
    });

    const refreshTokenDeleted = await refreshTokenRepositoryInMemory.findById(
      refreshToken.refresh_token_id,
    );

    expect(tokenResponse).toHaveProperty("token");
    expect(tokenResponse).toHaveProperty("refresh_token");
    expect(refreshTokenDeleted).toBeUndefined();
    expect(tokenResponse.refresh_token).not.toEqual(
      refreshToken.refresh_token_id,
    );
  });

  it("should not be able to refresh using same refresh token twice", async () => {
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

    const userResponse = await userRepositoryInMemory.create(user);

    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: userResponse.user_id,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
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
      new AppError(AppErrorMessages.REFRESH_TOKEN_INVALID, 400),
    );
  });

  it("should not be able to refresh token if user does not exists", async () => {
    const refreshToken = await refreshTokenRepositoryInMemory.create({
      refresh_token_user_id: 99999999,
      refresh_token_expires_in: dateProvider.addDays(
        Number(auth.refresh.expiresInDays),
      ),
    });

    await expect(
      refreshTokenUseCase.execute({
        refresh_token: refreshToken.refresh_token_id,
      }),
    ).rejects.toEqual(new AppError(AppErrorMessages.USER_NOT_FOUND, 404));
  });
});
