import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let token: string;

describe("List All Users Paginated Controller", () => {
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

  it("should be able to list all users paginated and create cache", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const usersToInsert = [];

    for (let i = 0; i < 15; i++) {
      usersToInsert.push({
        user_name: `User ${i}`,
        user_email: `user${i}@email.com`,
        user_password: "12345678",
        user_birth_date: new Date(),
        user_cpf: 12345678910 + i,
        user_gender_id: gender[0].gender_id,
      });
    }

    await dbConnection<UserEntity>("tb_users").insert(usersToInsert);

    const allUsers = await dbConnection<UserEntity>("tb_users").select([
      "user_id",
      "user_name",
      "user_email",
      "user_birth_date",
      "user_cpf",
      "user_created_at",
      "user_updated_at",
      "user_role_id",
      "user_gender_id",
    ]);

    const allUsersWithDateStrings = allUsers.map((user) => ({
      ...user,
      user_created_at: user.user_created_at.toISOString(),
      user_updated_at: user.user_updated_at.toISOString(),
      user_birth_date: user.user_birth_date.toISOString(),
    }));

    const users10Params = {
      page: 1,
      limit: 10,
    };

    const users20Params = {
      page: 1,
      limit: 20,
    };

    const users7Params = {
      page: 2,
      limit: 7,
    };

    const cache10Key = `${cachePrefixes.listAllUsersPaginated}:page:${users10Params.page}:limit:${users10Params.limit}`;

    const cache20Key = `${cachePrefixes.listAllUsersPaginated}:page:${users20Params.page}:limit:${users20Params.limit}`;

    const cache7Key = `${cachePrefixes.listAllUsersPaginated}:page:${users7Params.page}:limit:${users7Params.limit}`;

    const cache10Before = await cacheProvider.cacheGet(cache10Key);

    const cache20Before = await cacheProvider.cacheGet(cache20Key);

    const cache7Before = await cacheProvider.cacheGet(cache7Key);

    const response10 = await request(app)
      .get("/account/user")
      .query(users10Params)
      .set("Authorization", `Bearer ${token}`);

    const response20 = await request(app)
      .get("/account/user")
      .query(users20Params)
      .set("Authorization", `Bearer ${token}`);

    const response7 = await request(app)
      .get("/account/user")
      .query(users7Params)
      .set("Authorization", `Bearer ${token}`);

    const cache10After = await cacheProvider.cacheGet(cache10Key);

    const cache20After = await cacheProvider.cacheGet(cache20Key);

    const cache7After = await cacheProvider.cacheGet(cache7Key);

    expect(response10.status).toBe(200);
    expect(response10.body).toEqual(allUsersWithDateStrings.slice(0, 10));
    expect(response20.status).toBe(200);
    expect(response20.body).toEqual(allUsersWithDateStrings.slice(0, 20));
    expect(response7.status).toBe(200);
    expect(response7.body).toEqual(allUsersWithDateStrings.slice(7, 14));
    expect(cache10Before).toBeNull();
    expect(cache20Before).toBeNull();
    expect(cache7Before).toBeNull();
    expect(cache10After).toBe(JSON.stringify(response10.body));
    expect(cache20After).toBe(JSON.stringify(response20.body));
    expect(cache7After).toBe(JSON.stringify(response7.body));
  });

  it("should not be able to list all users paginated with a normal user", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken } = authResponse.body;

    const response = await request(app)
      .get("/account/user")
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

  it("should not be able to list all users paginated without authentication", async () => {
    const response = await request(app).get("/account/user").query({
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
