import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Create Gender Controller", () => {
  beforeAll(async () => {
    cacheProvider = new RedisCacheProvider();
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  beforeEach(async () => {
    await cacheProvider.cacheFlushAll();

    const { user_test_admin } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test_admin.user_email,
      user_password: user_test_admin.user_password,
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();

    await cacheProvider.cacheFlushAll();
    await cacheProvider.cacheDisconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to create a new gender and erase cache", async () => {
    const cacheKeyListAllGenders = cachePrefixes.listAllGenders;

    const cacheKeyListAllGendersPaginated = `${cachePrefixes.listAllGendersPaginated}:page:1:limit:10`;

    await cacheProvider.cacheSet({
      key: cacheKeyListAllGenders,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    await cacheProvider.cacheSet({
      key: cacheKeyListAllGendersPaginated,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBeforeListAllGenders = await cacheProvider.cacheGet(
      cacheKeyListAllGenders,
    );

    const cacheValueBeforeListAllGendersPaginated =
      await cacheProvider.cacheGet(cacheKeyListAllGendersPaginated);

    const response = await request(app)
      .post("/account/gender")
      .send({
        gender_name: "New Gender",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const cacheValueAfterListAllGenders = await cacheProvider.cacheGet(
      cacheKeyListAllGenders,
    );

    const cacheValueAfterListAllGendersPaginated = await cacheProvider.cacheGet(
      cacheKeyListAllGendersPaginated,
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("gender_id");
    expect(cacheValueBeforeListAllGenders).not.toBeNull();
    expect(cacheValueBeforeListAllGendersPaginated).not.toBeNull();
    expect(cacheValueAfterListAllGenders).toBeNull();
    expect(cacheValueAfterListAllGendersPaginated).toBeNull();
  });

  it("should not be able to create a gender if name already exists", async () => {
    const insertResponse = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    const gender = insertResponse[0];

    const response = await request(app)
      .post("/account/gender")
      .send({
        gender_name: gender.gender_name,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.GENDER_ALREADY_EXISTS);
  });

  it("should not be able to create a new gender with a normal user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post("/account/gender")
      .send({
        gender_name: "New Gender",
      })
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to create a new gender without a logged user", async () => {
    const response = await request(app).post("/account/gender").send({
      gender_name: "New Gender",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
