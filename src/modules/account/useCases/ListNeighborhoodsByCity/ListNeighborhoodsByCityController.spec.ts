import request from "supertest";

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

describe("List Neighborhoods By City Controller", () => {
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

  it("should be able to list all neighborhoods by city and create cache", async () => {
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

    const neighborhoodsToInsert = [];

    for (let i = 0; i < 10; i++) {
      neighborhoodsToInsert.push({
        neighborhood_name: `Neighborhood ${i}`,
        neighborhood_city_id: city[0].city_id,
      });
    }

    await dbConnection<NeighborhoodEntity>("tb_neighborhoods").insert(
      neighborhoodsToInsert,
    );

    const allNeighborhoods = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .where({
        neighborhood_city_id: city[0].city_id,
      })
      .select("*");

    const allNeighborhoodsWithDateStrings = allNeighborhoods.map(
      (neighborhood) => ({
        ...neighborhood,
        neighborhood_created_at:
          neighborhood.neighborhood_created_at.toISOString(),
      }),
    );

    const cacheKey = `${cachePrefixes.listNeighborhoodsByCity}:city_id:${city[0].city_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app).get(
      `/account/city/${city[0].city_id}/neighborhood`,
    );

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allNeighborhoodsWithDateStrings);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toEqual(JSON.stringify(response.body));
  });

  it("should return 204 if neighborhoods are empty", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "N2",
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

    const response = await request(app).get(
      `/account/city/${city[0].city_id}/neighborhood`,
    );

    expect(response.status).toBe(204);
  });

  it("should not be able to list the neighborhoods of a non-existing city", async () => {
    const response = await request(app).get("/account/city/999/neighborhood");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.CITY_NOT_FOUND);
  });
});
