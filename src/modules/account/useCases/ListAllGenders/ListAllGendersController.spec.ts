import request from "supertest";

import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

describe("List All Genders Controller", () => {
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

  it("should be able to list all genders and create cache", async () => {
    await dbConnection<GenderEntity>("tb_genders").insert({
      gender_name: "New Gender",
    });

    const allGenders = await dbConnection<GenderEntity>("tb_genders").select(
      "*",
    );

    const allGendersWithDateStrings = allGenders.map((gender) => ({
      ...gender,
      gender_created_at: gender.gender_created_at.toISOString(),
    }));

    const cacheKey = cachePrefixes.listAllGenders;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app).get("/account/gender/all");

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allGendersWithDateStrings);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toEqual(JSON.stringify(response.body));
  });

  it("should return 204 if genders are empty", async () => {
    await dbConnection<UserEntity>("tb_users").del();

    await dbConnection<GenderEntity>("tb_genders").del();

    const response = await request(app).get("/account/gender/all");

    expect(response.status).toBe(204);
  });
});
