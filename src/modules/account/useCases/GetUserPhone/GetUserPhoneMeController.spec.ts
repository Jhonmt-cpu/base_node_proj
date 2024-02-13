import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let cacheProvider: RedisCacheProvider;

let hashProvider: BcryptjsHashProvider;

describe("Get User Phone Me Controller", () => {
  beforeAll(async () => {
    cacheProvider = new RedisCacheProvider();
    hashProvider = new BcryptjsHashProvider();

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

  it("should be able to get a user phone with authentication and create cache", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken, user } = authResponse.body;

    const cacheKey = `${cachePrefixes.getUserPhone}:${user.user_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app)
      .get(`/account/user/me/phone`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user_phone_id");
    expect(response.body.user_phone_id).toBe(user.user_id);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toBe(JSON.stringify(response.body));
  });

  it("should be able to get an user phone from cache", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken, user } = authResponse.body;

    const firstGetResponse = await request(app)
      .get(`/account/user/me/phone`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const cacheKey = `${cachePrefixes.getUserPhone}:${user.user_id}`;

    const spyCache = jest.spyOn(RedisCacheProvider.prototype, "cacheGet");

    const secondGetResponse = await request(app)
      .get(`/account/user/me/phone`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const valueReturnedCache = await spyCache.mock.results[0].value;

    expect(firstGetResponse.status).toBe(200);
    expect(secondGetResponse.status).toBe(200);
    expect(firstGetResponse.body).toEqual(secondGetResponse.body);
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(valueReturnedCache).toBe(JSON.stringify(firstGetResponse.body));
  });

  it("should not be able to get a non existing user", async () => {
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

    const passwordHash = await hashProvider.generateHash(user.user_password);

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: passwordHash,
      })
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

    const authResponse = await request(app).post("/auth/login").send({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const userToken = authResponse.body.token;

    await dbConnection<UserEntity>("tb_users")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .del();

    const response = await request(app)
      .get(`/account/user/me/phone`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_PHONE_NOT_FOUND);
  });

  it("should not be able to get a user phone without authentication", async () => {
    const response = await request(app).get(`/account/user/me/phone`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
