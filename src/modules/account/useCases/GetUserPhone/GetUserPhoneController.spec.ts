import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Get User Phone Controller", () => {
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

  it("should be able to get a user with an admin request and create cache", async () => {
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

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert(user)
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const userPhoneInsertResponse = await dbConnection<PhoneEntity>("tb_phones")
      .insert({
        user_phone_id: userInsertResponse[0].user_id,
        phone_number: 154823594,
        phone_ddd: 11,
      })
      .returning("*");

    if (!userPhoneInsertResponse[0]) {
      throw new Error("User Phone not created");
    }

    const cacheKey = `${cachePrefixes.getUserPhone}:${userInsertResponse[0].user_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app)
      .get(`/account/user/${userInsertResponse[0].user_id}/phone`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user_phone_id");
    expect(response.body.user_phone_id).toBe(userInsertResponse[0].user_id);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toBe(JSON.stringify(response.body));
  });

  it("should be able to get a user with an admin request and get from cache", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const user = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678911,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert(user)
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const userPhoneInsertResponse = await dbConnection<PhoneEntity>("tb_phones")
      .insert({
        user_phone_id: userInsertResponse[0].user_id,
        phone_number: 154823595,
        phone_ddd: 11,
      })
      .returning("*");

    if (!userPhoneInsertResponse[0]) {
      throw new Error("User Phone not created");
    }

    const firstGetResponse = await request(app)
      .get(`/account/user/${userInsertResponse[0].user_id}/phone`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const cacheKey = `${cachePrefixes.getUserPhone}:${userInsertResponse[0].user_id}`;

    const spyCache = jest.spyOn(RedisCacheProvider.prototype, "cacheGet");

    const secondGetResponse = await request(app)
      .get(`/account/user/${userInsertResponse[0].user_id}/phone`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const returnedCache = await spyCache.mock.results[0].value;

    expect(firstGetResponse.status).toBe(200);
    expect(secondGetResponse.status).toBe(200);
    expect(firstGetResponse.body).toEqual(secondGetResponse.body);
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(returnedCache).toBe(JSON.stringify(firstGetResponse.body));
  });

  it("should not be able to get a user phone with an admin request if user does not exist", async () => {
    const response = await request(app)
      .get(`/account/user/99999/phone`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_PHONE_NOT_FOUND);
  });

  it("should not be able to get a user phone with a normal user request", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const tokenUser = loginResponse.body.token;

    const response = await request(app)
      .get(`/account/user/1/phone`)
      .set({
        Authorization: `Bearer ${tokenUser}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to get a user phone without authentication", async () => {
    const response = await request(app).get(`/account/user/1/phone`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
