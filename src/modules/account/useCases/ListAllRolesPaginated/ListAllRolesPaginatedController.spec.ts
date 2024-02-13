import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let token: string;

describe("List All Roles Paginated Controller", () => {
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

  it("should be able to list all roles paginated and create cache", async () => {
    const rolesToInsert = [];

    for (let i = 0; i < 15; i++) {
      rolesToInsert.push({
        role_name: `Role ${i}`,
      });
    }

    await dbConnection<RoleEntity>("tb_roles").insert(rolesToInsert);

    const allRoles = await dbConnection<RoleEntity>("tb_roles").select("*");

    const allRolesWithDateStrings = allRoles.map((role) => ({
      ...role,
      role_created_at: role.role_created_at.toISOString(),
    }));

    const roles10Params = {
      page: 1,
      limit: 10,
    };

    const roles20Params = {
      page: 1,
      limit: 20,
    };

    const roles7Params = {
      page: 2,
      limit: 7,
    };

    const cacheKey10 = `${cachePrefixes.listAllRolesPaginated}:page:${roles10Params.page}:limit:${roles10Params.limit}`;

    const cacheKey20 = `${cachePrefixes.listAllRolesPaginated}:page:${roles20Params.page}:limit:${roles20Params.limit}`;

    const cacheKey7 = `${cachePrefixes.listAllRolesPaginated}:page:${roles7Params.page}:limit:${roles7Params.limit}`;

    const cacheValueBefore10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueBefore20 = await cacheProvider.cacheGet(cacheKey20);

    const cacheValueBefore7 = await cacheProvider.cacheGet(cacheKey7);

    const response10 = await request(app)
      .get("/account/role")
      .query({
        page: 1,
        limit: 10,
      })
      .set("Authorization", `Bearer ${token}`);

    const response20 = await request(app)
      .get("/account/role")
      .query({
        page: 1,
        limit: 20,
      })
      .set("Authorization", `Bearer ${token}`);

    const response7 = await request(app)
      .get("/account/role")
      .query({
        page: 2,
        limit: 7,
      })
      .set("Authorization", `Bearer ${token}`);

    const cacheValueAfter10 = await cacheProvider.cacheGet(cacheKey10);

    const cacheValueAfter20 = await cacheProvider.cacheGet(cacheKey20);

    const cacheValueAfter7 = await cacheProvider.cacheGet(cacheKey7);

    expect(response10.status).toBe(200);
    expect(response10.body).toEqual(allRolesWithDateStrings.slice(0, 10));
    expect(response20.status).toBe(200);
    expect(response20.body).toEqual(allRolesWithDateStrings.slice(0, 20));
    expect(response7.status).toBe(200);
    expect(response7.body).toEqual(allRolesWithDateStrings.slice(7, 14));
    expect(cacheValueBefore10).toBeNull();
    expect(cacheValueBefore20).toBeNull();
    expect(cacheValueBefore7).toBeNull();
    expect(cacheValueAfter10).not.toBeNull();
    expect(cacheValueAfter20).not.toBeNull();
    expect(cacheValueAfter7).not.toBeNull();
    expect(cacheValueAfter10).toEqual(JSON.stringify(response10.body));
    expect(cacheValueAfter20).toEqual(JSON.stringify(response20.body));
    expect(cacheValueAfter7).toEqual(JSON.stringify(response7.body));
  });

  it("should be able to list all roles paginated from cache", async () => {
    const rolesToInsert = [];

    for (let i = 0; i < 15; i++) {
      rolesToInsert.push({
        role_name: `Role ${i + 15}`,
      });
    }

    await dbConnection<RoleEntity>("tb_roles").insert(rolesToInsert);

    const roles10Params = {
      page: 1,
      limit: 10,
    };

    const roles20Params = {
      page: 1,
      limit: 20,
    };

    const roles7Params = {
      page: 2,
      limit: 7,
    };

    const firstGetResponse10 = await request(app)
      .get("/account/role")
      .query(roles10Params)
      .set("Authorization", `Bearer ${token}`);

    const firstGetResponse20 = await request(app)
      .get("/account/role")
      .query(roles20Params)
      .set("Authorization", `Bearer ${token}`);

    const firstGetResponse7 = await request(app)
      .get("/account/role")
      .query(roles7Params)
      .set("Authorization", `Bearer ${token}`);

    const spyOnCacheProvider = jest.spyOn(
      RedisCacheProvider.prototype,
      "cacheGet",
    );

    const cacheKey10 = `${cachePrefixes.listAllRolesPaginated}:page:${roles10Params.page}:limit:${roles10Params.limit}`;

    const cacheKey20 = `${cachePrefixes.listAllRolesPaginated}:page:${roles20Params.page}:limit:${roles20Params.limit}`;

    const cacheKey7 = `${cachePrefixes.listAllRolesPaginated}:page:${roles7Params.page}:limit:${roles7Params.limit}`;

    const secondGetResponse10 = await request(app)
      .get("/account/role")
      .query(roles10Params)
      .set("Authorization", `Bearer ${token}`);

    const secondGetResponse20 = await request(app)
      .get("/account/role")
      .query(roles20Params)
      .set("Authorization", `Bearer ${token}`);

    const secondGetResponse7 = await request(app)
      .get("/account/role")
      .query(roles7Params)
      .set("Authorization", `Bearer ${token}`);

    const spyCacheValueReturned10 = await spyOnCacheProvider.mock.results[0]
      .value;

    const spyCacheValueReturned20 = await spyOnCacheProvider.mock.results[1]
      .value;

    const spyCacheValueReturned7 = await spyOnCacheProvider.mock.results[2]
      .value;

    expect(firstGetResponse10.status).toBe(200);
    expect(firstGetResponse20.status).toBe(200);
    expect(firstGetResponse7.status).toBe(200);
    expect(secondGetResponse10.status).toBe(200);
    expect(secondGetResponse20.status).toBe(200);
    expect(secondGetResponse7.status).toBe(200);
    expect(firstGetResponse10.body).toEqual(secondGetResponse10.body);
    expect(firstGetResponse20.body).toEqual(secondGetResponse20.body);
    expect(firstGetResponse7.body).toEqual(secondGetResponse7.body);
    expect(spyCacheValueReturned10).toBe(
      JSON.stringify(firstGetResponse10.body),
    );
    expect(spyCacheValueReturned20).toBe(
      JSON.stringify(firstGetResponse20.body),
    );
    expect(spyCacheValueReturned7).toBe(JSON.stringify(firstGetResponse7.body));
    expect(spyOnCacheProvider).toHaveBeenCalledWith(cacheKey10);
    expect(spyOnCacheProvider).toHaveBeenCalledWith(cacheKey20);
    expect(spyOnCacheProvider).toHaveBeenCalledWith(cacheKey7);
  });

  it("should not be able to list all roles paginated with a normal user", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken } = authResponse.body;

    const response = await request(app)
      .get("/account/role")
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

  it("should not be able to list all roles paginated without authentication", async () => {
    const response = await request(app).get("/account/role").query({
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
