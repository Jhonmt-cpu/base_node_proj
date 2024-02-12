import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Create City Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    cacheProvider = new RedisCacheProvider();
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

  it("should be able to create a new city an erase cache", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state[0].state_id}`;

    await cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City",
        city_state_id: state[0].state_id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const cacheValue = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("city_id");
    expect(cacheValueBefore).not.toBeNull();
    expect(cacheValue).toBeNull();
  });

  it("should not be able to create a new city with invalid state", async () => {
    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City",
        city_state_id: 999,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.STATE_NOT_FOUND);
  });

  it("should not be able to create a new city with same name and state", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    await dbConnection<CityEntity>("tb_cities").insert({
      city_name: "New City 2",
      city_state_id: state[0].state_id,
    });

    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City 2",
        city_state_id: state[0].state_id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.CITY_ALREADY_EXISTS);
  });

  it("should not be able to create a new city with a normal user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City",
        city_state_id: 1,
      })
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to create a new city without a logged user", async () => {
    const response = await request(app).post("/account/city").send({
      city_name: "New City",
      city_state_id: 1,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
