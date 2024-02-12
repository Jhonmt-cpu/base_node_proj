import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Create Neighborhood Controller", () => {
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

  it("should be able to create a new neighborhood and erase cache", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City",
        city_state_id: state[0].state_id,
      })
      .returning("*");

    if (!city[0]) {
      throw new Error("City not created");
    }

    const cacheKey = `${cachePrefixes.listNeighborhoodsByCity}:city_id:${city[0].city_id}`;

    await cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app)
      .post("/account/neighborhood")
      .send({
        neighborhood_name: "New Neighborhood",
        neighborhood_city_id: city[0].city_id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("neighborhood_id");
    expect(cacheValueBefore).not.toBeNull();
    expect(cacheValueAfter).toBeNull();
  });

  it("should not be able to create a new neighborhood with invalid city", async () => {
    const response = await request(app)
      .post("/account/neighborhood")
      .send({
        neighborhood_name: "New Neighborhood",
        neighborhood_city_id: 999,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.CITY_NOT_FOUND);
  });

  it("should not be able to create a new neighborhood with same name and city", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 2",
        city_state_id: state[0].state_id,
      })
      .returning("*");

    if (!city[0]) {
      throw new Error("City not created");
    }

    await dbConnection<NeighborhoodEntity>("tb_neighborhoods").insert({
      neighborhood_name: "New Neighborhood 2",
      neighborhood_city_id: city[0].city_id,
    });

    const response = await request(app)
      .post("/account/neighborhood")
      .send({
        neighborhood_name: "New Neighborhood 2",
        neighborhood_city_id: city[0].city_id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      AppErrorMessages.NEIGHBORHOOD_ALREADY_EXISTS,
    );
  });

  it("should not be able to create a new neighborhood with a normal user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post("/account/neighborhood")
      .send({
        neighborhood_name: "New Neighborhood",
        neighborhood_city_id: 1,
      })
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to create a new neighborhood without a logged user", async () => {
    const response = await request(app).post("/account/neighborhood").send({
      neighborhood_name: "New Neighborhood",
      neighborhood_city_id: 1,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
