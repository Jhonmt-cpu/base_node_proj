import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";
import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let cacheProvider: RedisCacheProvider;

describe("Login Controller", () => {
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

  it("should be able to authenticate a user", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const response = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const refreshTokenCache = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${response.body.refresh_token}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refresh_token");
    expect(response.body).toHaveProperty("user");
    expect(refreshTokenCache).not.toBeNull();
  });

  it("should not be able to authenticate a user with wrong email", async () => {
    const response = await request(app).post("/auth/login").send({
      user_email: "wrongemail@email.com",
      user_password: "12345678",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      AppErrorMessages.INCORRECT_EMAIL_OR_PASSWORD,
    );
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    const { user_email } = testConfig.user_test;

    const response = await request(app).post("/auth/login").send({
      user_email,
      user_password: "wrong_password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      AppErrorMessages.INCORRECT_EMAIL_OR_PASSWORD,
    );
  });

  it("should clean refresh token cache when user authenticate", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const response = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const refreshTokenFirstCache = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${response.body.refresh_token}`,
    );

    const response2 = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const refreshTokenSecondCache = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${response2.body.refresh_token}`,
    );

    const refreshTokenFirstCacheDeleted = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${response.body.refresh_token}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refresh_token");
    expect(response.body).toHaveProperty("user");
    expect(refreshTokenFirstCache).not.toBeNull();

    expect(response2.status).toBe(200);
    expect(response2.body).toHaveProperty("token");
    expect(response2.body).toHaveProperty("refresh_token");
    expect(response2.body).toHaveProperty("user");
    expect(refreshTokenSecondCache).not.toBeNull();
    expect(refreshTokenFirstCacheDeleted).toBeNull();
  });
});
