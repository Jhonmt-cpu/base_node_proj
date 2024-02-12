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

describe("List All Genders Paginated Controller", () => {
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

  it("should be able to list all genders paginated and create cache", async () => {
    const gendersToInsert = [];

    for (let i = 0; i < 15; i++) {
      gendersToInsert.push({
        gender_name: `Gender ${i}`,
      });
    }

    await dbConnection<GenderEntity>("tb_genders").insert(gendersToInsert);

    const allGenders = await dbConnection<GenderEntity>("tb_genders").select(
      "*",
    );

    const allGendersWithDateStrings = allGenders.map((gender) => ({
      ...gender,
      gender_created_at: gender.gender_created_at.toISOString(),
    }));

    const genders10Params = {
      page: 1,
      limit: 10,
    };

    const genders20Params = {
      page: 1,
      limit: 20,
    };

    const genders7Params = {
      page: 2,
      limit: 7,
    };

    const cacheKey10 = `${cachePrefixes.listAllGendersPaginated}:page:${genders10Params.page}:limit:${genders10Params.limit}`;

    const cacheKey20 = `${cachePrefixes.listAllGendersPaginated}:page:${genders20Params.page}:limit:${genders20Params.limit}`;

    const cacheKey7 = `${cachePrefixes.listAllGendersPaginated}:page:${genders7Params.page}:limit:${genders7Params.limit}`;

    const cacheValueBefore10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueBefore20 = await cacheProvider.cacheGet(cacheKey20);

    const cacheValueBefore7 = await cacheProvider.cacheGet(cacheKey7);

    const response10 = await request(app)
      .get("/account/gender")
      .query(genders10Params)
      .set("Authorization", `Bearer ${token}`);

    const response20 = await request(app)
      .get("/account/gender")
      .query(genders20Params)
      .set("Authorization", `Bearer ${token}`);

    const response7 = await request(app)
      .get("/account/gender")
      .query(genders7Params)
      .set("Authorization", `Bearer ${token}`);

    const cacheValueAfter10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueAfter20 = await cacheProvider.cacheGet(cacheKey20);

    const cacheValueAfter7 = await cacheProvider.cacheGet(cacheKey7);

    expect(response10.status).toBe(200);
    expect(response10.body).toEqual(allGendersWithDateStrings.slice(0, 10));
    expect(response20.status).toBe(200);
    expect(response20.body).toEqual(allGendersWithDateStrings.slice(0, 20));
    expect(response7.status).toBe(200);
    expect(response7.body).toEqual(allGendersWithDateStrings.slice(7, 14));
    expect(cacheValueBefore10).toBeNull();
    expect(cacheValueBefore20).toBeNull();
    expect(cacheValueBefore7).toBeNull();
    expect(cacheValueAfter10).not.toBeNull();
    expect(cacheValueAfter20).not.toBeNull();
    expect(cacheValueAfter7).not.toBeNull();
    expect(cacheValueAfter10).toBe(JSON.stringify(response10.body));
    expect(cacheValueAfter20).toBe(JSON.stringify(response20.body));
    expect(cacheValueAfter7).toBe(JSON.stringify(response7.body));
  });

  it("should not be able to list all genders paginated with a normal user", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken } = authResponse.body;

    const response = await request(app)
      .get("/account/gender")
      .query({
        page: 1,
        limit: 10,
      })
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to list all genders paginated without authentication", async () => {
    const response = await request(app).get("/account/gender").query({
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
