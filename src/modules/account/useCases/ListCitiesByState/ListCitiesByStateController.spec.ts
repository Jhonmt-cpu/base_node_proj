import request from "supertest";

import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

describe("List Cities By State Controller", () => {
  beforeAll(async () => {
    cacheProvider = new RedisCacheProvider();

    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  beforeEach(async () => {
    await cacheProvider.cacheFlushAll();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();

    await cacheProvider.cacheFlushAll();
    await cacheProvider.cacheDisconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to list all cities by state and create cache", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const citiesToInsert = [];

    for (let i = 0; i < 10; i++) {
      citiesToInsert.push({
        city_name: `City ${i}`,
        city_state_id: state[0].state_id,
      });
    }

    await dbConnection<CityEntity>("tb_cities").insert(citiesToInsert);

    const allCities = await dbConnection<CityEntity>("tb_cities")
      .where({
        city_state_id: state[0].state_id,
      })
      .select("*");

    const allCitiesWithDateStrings = allCities.map((city) => ({
      ...city,
      city_created_at: city.city_created_at.toISOString(),
    }));

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state[0].state_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app).get(
      `/account/state/${state[0].state_id}/city`,
    );

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allCitiesWithDateStrings);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toEqual(JSON.stringify(response.body));
  });

  it("should be able to list all cities by state from cache", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const citiesToInsert = [];

    for (let i = 0; i < 10; i++) {
      citiesToInsert.push({
        city_name: `City ${i + 10}`,
        city_state_id: state[0].state_id,
      });
    }

    await dbConnection<CityEntity>("tb_cities").insert(citiesToInsert);

    const firstGetResponse = await request(app).get(
      `/account/state/${state[0].state_id}/city`,
    );

    const spyOnCache = jest.spyOn(RedisCacheProvider.prototype, "cacheGet");

    const cacheKey = `${cachePrefixes.listCitiesByState}:state_id:${state[0].state_id}`;

    const secondGetResponse = await request(app).get(
      `/account/state/${state[0].state_id}/city`,
    );

    const valueCacheReturned = await spyOnCache.mock.results[0].value;

    expect(firstGetResponse.status).toBe(200);
    expect(secondGetResponse.status).toBe(200);
    expect(firstGetResponse.body).toEqual(secondGetResponse.body);
    expect(spyOnCache).toHaveBeenCalledWith(cacheKey);
    expect(JSON.stringify(firstGetResponse.body)).toEqual(valueCacheReturned);
  });

  it("should return 204 if cities are empty", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 3",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const response = await request(app).get(
      `/account/state/${state[0].state_id}/city`,
    );

    expect(response.status).toBe(204);
  });

  it("should not be able to list the cities of a non-existing state", async () => {
    const response = await request(app).get("/account/state/999/city");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.STATE_NOT_FOUND);
  });
});
