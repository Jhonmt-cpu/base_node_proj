import request from "supertest";

import testConfig from "@config/test";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

describe("Logout Me Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();

    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to logout a me user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const { user } = loginResponse.body;

    const userRefreshTokenBefore = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id: user.user_id,
      });

    const response = await request(app)
      .post("/auth/logout/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const userRefreshTokenAfter = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id: user.user_id,
      });

    expect(response.status).toBe(204);
    expect(userRefreshTokenBefore.length).toBeGreaterThan(0);
    expect(userRefreshTokenAfter).toHaveLength(0);
  });

  it("should not be able to logout without authentication", async () => {
    const response = await request(app).post("/auth/logout").send({
      user_id: 1,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
