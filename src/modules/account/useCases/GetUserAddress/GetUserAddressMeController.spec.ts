import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let hashProvider: BcryptjsHashProvider;

let cacheProvider: RedisCacheProvider;

describe("Get User Address Me Controller", () => {
  beforeAll(async () => {
    hashProvider = new BcryptjsHashProvider();
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

  it("should be able to get a user address with authentication and create cache", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken, user } = authResponse.body;

    const cacheKey = `${cachePrefixes.getUserAddress}:${user.user_id}`;

    const cacheValueBefore = await cacheProvider.cacheGet(cacheKey);

    const response = await request(app)
      .get(`/account/user/me/address`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const cacheValueAfter = await cacheProvider.cacheGet(cacheKey);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user_address_id");
    expect(response.body.user_address_id).toBe(user.user_id);
    expect(cacheValueBefore).toBeNull();
    expect(cacheValueAfter).not.toBeNull();
    expect(cacheValueAfter).toBe(JSON.stringify(response.body));
  });

  it("should be able to get an user address from cache", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken, user } = authResponse.body;

    const firstGetResponse = await request(app)
      .get(`/account/user/me/address`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const cacheKey = `${cachePrefixes.getUserAddress}:${user.user_id}`;

    const spyCache = jest.spyOn(RedisCacheProvider.prototype, "cacheGet");

    const secondGetResponse = await request(app)
      .get(`/account/user/me/address`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const returnedCache = await spyCache.mock.results[0].value;

    expect(firstGetResponse.status).toBe(200);
    expect(secondGetResponse.status).toBe(200);
    expect(firstGetResponse.body).toEqual(secondGetResponse.body);
    expect(spyCache).toHaveBeenCalledWith(cacheKey);
    expect(returnedCache).toBe(JSON.stringify(firstGetResponse.body));
  });

  it("should not be able to get a non existing user address", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

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

    const neighborhood = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .insert({
        neighborhood_name: "New Neighborhood",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
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

    const userAddressInsertResponse = await dbConnection<AddressEntity>(
      "tb_addresses",
    )
      .insert({
        user_address_id: userInsertResponse[0].user_id,
        address_street: "New Street",
        address_number: 123,
        address_neighborhood_id: neighborhood[0].neighborhood_id,
        address_zip_code: 12345678,
      })
      .returning("*");

    if (!userAddressInsertResponse[0]) {
      throw new Error("User Address not created");
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
      .get(`/account/user/me/address`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_ADDRESS_NOT_FOUND);
  });

  it("should not be able to get a user address without authentication", async () => {
    const response = await request(app).get(`/account/user/me/address`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
