import request from "supertest";

import testConfig from "@config/test";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";

let hashProvider: BcryptjsHashProvider;

let token: string;

describe("Logout Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
  });

  beforeEach(async () => {
    const { user_test_admin } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test_admin.user_email,
      user_password: user_test_admin.user_password,
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();

    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to logout an user with admin request", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678910,
      user_gender_id: gender[0].gender_id,
    };

    const passwordHashed = await hashProvider.generateHash(user.user_password);

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: passwordHashed,
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    await request(app).post("/auth/login").send({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const userRefreshTokenBefore = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id: userInsertResponse[0].user_id,
      });

    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: userInsertResponse[0].user_id,
      });

    const userRefreshTokenAfter = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id: userInsertResponse[0].user_id,
      });

    expect(response.status).toBe(204);
    expect(userRefreshTokenBefore.length).toBeGreaterThan(0);
    expect(userRefreshTokenAfter.length).toBe(0);
  });

  it("should not be able to logout an user with user request", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        user_id: 1,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to logout without authentication", async () => {
    const response = await request(app).post("/auth/logout").send({
      user_id: 1,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
