import request from "supertest";
import { v4 as uuid } from "uuid";

import testConfig from "@config/test";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";
import { UserRepository } from "@modules/account/infra/knex/repositories/UserRepository";

describe("Refresh Token Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to refresh a token", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const response = await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    const newRefreshToken = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_id: response.body.refresh_token,
      })
      .first();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refresh_token");
    expect(response.body.refresh_token).not.toBe(
      loginResponse.body.refresh_token,
    );
    expect(newRefreshToken).toBeTruthy();
  });

  it("should not be able to refresh with same token twice", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const firstRefresh = await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    const secondRefresh = await request(app).post("/auth/refresh").send({
      refresh_token: firstRefresh.body.refresh_token,
    });

    const invalidRefresh = await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    expect(firstRefresh.status).toBe(200);
    expect(secondRefresh.status).toBe(200);
    expect(invalidRefresh.status).toBe(400);
    expect(invalidRefresh.body.message).toBe(
      AppErrorMessages.REFRESH_TOKEN_INVALID,
    );
  });

  it("should not be able to refresh a token with a non existing refresh token", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refresh_token: uuid(),
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.REFRESH_TOKEN_INVALID);
  });

  it("should not be able to refresh a token if user does not exists", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    jest
      .spyOn(UserRepository.prototype, "findByIdWithRole")
      .mockResolvedValueOnce(undefined);

    const response = await request(app).post("/auth/refresh").send({
      refresh_token: loginResponse.body.refresh_token,
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_NOT_FOUND);
  });
});
