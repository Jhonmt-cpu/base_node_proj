import request from "supertest";
import { v4 as uuid } from "uuid";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";
import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let cacheProvider: RedisCacheProvider;

describe("Refresh Token Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    cacheProvider = new RedisCacheProvider();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  //! Colocar troca de refresh token sempre que um refresh acontecer

  it("should be able to refresh a token", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const response = await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    const refreshTokenCacheOld = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${loginResponse.body.refresh_token}`,
    );

    const refreshTokenCache = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${response.body.refresh_token}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refresh_token");
    expect(refreshTokenCache).not.toBeNull();
    expect(refreshTokenCacheOld).toBeNull();
  });

  it("should not be able to refresh with same token twice", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    const response = await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      AppErrorMessages.REFRESH_TOKEN_NOT_FOUND,
    );
  });

  it("should not be able to refresh a token with a non existing refresh token in cache", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refresh_token: uuid(),
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      AppErrorMessages.REFRESH_TOKEN_NOT_FOUND,
    );
  });

  it("should not be able to refresh a token with a non existing refresh token in database", async () => {
    const refresh_token = uuid();

    await cacheProvider.cacheSet({
      key: `${cachePrefixes.refreshToken}:${refresh_token}`,
      value: JSON.stringify({
        user_id: 1,
        user_name: "Test User",
        role_name: "Test Role",
      }),
      expiresInSeconds: 30 * 24 * 60 * 60,
    });

    const response = await request(app).post("/auth/refresh").send({
      refresh_token: refresh_token,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.REFRESH_TOKEN_INVALID);
  });
});
