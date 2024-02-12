import request from "supertest";

import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";
import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";

import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let hashProvider: BcryptjsHashProvider;

let cacheProvider: RedisCacheProvider;

describe("Delete User Me Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
    cacheProvider = new RedisCacheProvider();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to delete a user with the password and erase cache", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

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

    const neighborhood = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .insert({
        neighborhood_name: "New Neighborhood 2",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678910,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    await dbConnection<AddressEntity>("tb_addresses").insert({
      user_address_id: userInsertResponse[0].user_id,
      address_street: "Street Test 2",
      address_number: 123,
      address_neighborhood_id: neighborhood[0].neighborhood_id,
      address_zip_code: 12345678,
    });

    await dbConnection<PhoneEntity>("tb_phones").insert({
      user_phone_id: userInsertResponse[0].user_id,
      phone_number: 999999998,
      phone_ddd: 34,
    });

    const cacheGetUserKey = `${cachePrefixes.getUser}:${userInsertResponse[0].user_id}`;

    const cacheGetUserAddressKey = `${cachePrefixes.getUserAddress}:${userInsertResponse[0].user_id}`;

    const cacheGetUserPhoneKey = `${cachePrefixes.getUserPhone}:${userInsertResponse[0].user_id}`;

    const cacheGetUserCompleteKey = `${cachePrefixes.getUserComplete}:${userInsertResponse[0].user_id}`;

    const cacheListAllUsersPaginatedKey = `${cachePrefixes.listAllUsersPaginated}`;

    await cacheProvider.cacheSet({
      key: cacheGetUserKey,
      value: JSON.stringify(userInsertResponse[0]),
      expiresInSeconds: 60 * 60,
    });

    await cacheProvider.cacheSet({
      key: cacheGetUserAddressKey,
      value: JSON.stringify({}),
      expiresInSeconds: 60 * 60,
    });

    await cacheProvider.cacheSet({
      key: cacheGetUserPhoneKey,
      value: JSON.stringify({}),
      expiresInSeconds: 60 * 60,
    });

    await cacheProvider.cacheSet({
      key: cacheGetUserCompleteKey,
      value: JSON.stringify({
        user: userInsertResponse[0],
        address: {},
        phone: {},
      }),
      expiresInSeconds: 60 * 60,
    });

    await cacheProvider.cacheSet({
      key: cacheListAllUsersPaginatedKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60,
    });

    const cacheGetUserBefore = await cacheProvider.cacheGet(cacheGetUserKey);

    const cacheGetUserAddressBefore = await cacheProvider.cacheGet(
      cacheGetUserAddressKey,
    );

    const cacheGetUserPhoneBefore = await cacheProvider.cacheGet(
      cacheGetUserPhoneKey,
    );

    const cacheGetUserCompleteBefore = await cacheProvider.cacheGet(
      cacheGetUserCompleteKey,
    );

    const cacheListAllUsersPaginatedBefore = await cacheProvider.cacheGet(
      cacheListAllUsersPaginatedKey,
    );

    const userLoginResponse = await request(app).post("/auth/login").send({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const { token: normalToken, refresh_token } = userLoginResponse.body;

    const response = await request(app)
      .delete(`/account/user/me`)
      .query({
        user_password: user.user_password,
      })
      .set({
        Authorization: `Bearer ${normalToken}`,
      });

    const userDeleted = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .first();

    const refreshTokensDeleted = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id: userInsertResponse[0].user_id,
      });

    const refreshTokenCacheDeleted = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${refresh_token}`,
    );

    const userPhoneDeleted = await dbConnection<PhoneEntity>("tb_phones")
      .select("*")
      .where({
        user_phone_id: userInsertResponse[0].user_id,
      })
      .first();

    const userAddressDeleted = await dbConnection<AddressEntity>("tb_addresses")
      .select("*")
      .where({
        user_address_id: userInsertResponse[0].user_id,
      })
      .first();

    const cacheGetUserAfter = await cacheProvider.cacheGet(cacheGetUserKey);
    const cacheGetUserAddressAfter = await cacheProvider.cacheGet(
      cacheGetUserAddressKey,
    );
    const cacheGetUserPhoneAfter = await cacheProvider.cacheGet(
      cacheGetUserPhoneKey,
    );
    const cacheGetUserCompleteAfter = await cacheProvider.cacheGet(
      cacheGetUserCompleteKey,
    );
    const cacheListAllUsersPaginatedAfter = await cacheProvider.cacheGet(
      cacheListAllUsersPaginatedKey,
    );

    expect(response.status).toBe(204);
    expect(userDeleted).toBeUndefined();
    expect(refreshTokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
    expect(cacheGetUserBefore).not.toBeNull();
    expect(cacheGetUserAfter).toBeNull();
    expect(cacheGetUserAddressBefore).not.toBeNull();
    expect(cacheGetUserAddressAfter).toBeNull();
    expect(cacheGetUserPhoneBefore).not.toBeNull();
    expect(cacheGetUserPhoneAfter).toBeNull();
    expect(cacheGetUserCompleteBefore).not.toBeNull();
    expect(cacheGetUserCompleteAfter).toBeNull();
    expect(cacheListAllUsersPaginatedBefore).not.toBeNull();
    expect(cacheListAllUsersPaginatedAfter).toBeNull();
  });

  it("should not be able to delete a user with the wrong password", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 3",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 3",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 3",
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
        neighborhood_name: "New Neighborhood 3",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 3",
      user_email: "usertest3@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678910,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    await dbConnection<AddressEntity>("tb_addresses").insert({
      user_address_id: userInsertResponse[0].user_id,
      address_street: "Street Test 3",
      address_number: 123,
      address_neighborhood_id: neighborhood[0].neighborhood_id,
      address_zip_code: 12345678,
    });

    await dbConnection<PhoneEntity>("tb_phones").insert({
      user_phone_id: userInsertResponse[0].user_id,
      phone_number: 999999998,
      phone_ddd: 34,
    });

    const userLoginResponse = await request(app).post("/auth/login").send({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const { token: normalToken, refresh_token } = userLoginResponse.body;

    const response = await request(app)
      .delete(`/account/user/me`)
      .query({
        user_password: "wrong password",
      })
      .set({
        Authorization: `Bearer ${normalToken}`,
      });

    const userDeleted = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .first();

    const refreshTokensDeleted = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_user_id: userInsertResponse[0].user_id,
      });

    const refreshTokenCacheDeleted = await cacheProvider.cacheGet(
      `${cachePrefixes.refreshToken}:${refresh_token}`,
    );

    const userPhoneDeleted = await dbConnection<PhoneEntity>("tb_phones")
      .select("*")
      .where({
        user_phone_id: userInsertResponse[0].user_id,
      })
      .first();

    const userAddressDeleted = await dbConnection<AddressEntity>("tb_addresses")
      .select("*")
      .where({
        user_address_id: userInsertResponse[0].user_id,
      })
      .first();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      AppErrorMessages.USER_INCORRECT_PASSWORD,
    );
    expect(userDeleted).toHaveProperty("user_id");
    expect(refreshTokensDeleted).toHaveLength(1);
    expect(refreshTokenCacheDeleted).not.toBeNull();
    expect(userPhoneDeleted).toHaveProperty("user_phone_id");
    expect(userAddressDeleted).toHaveProperty("user_address_id");
  });

  it("should not be able to delete a me user if it does not exists", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 4",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 4",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 4",
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
        neighborhood_name: "New Neighborhood 4",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 4",
      user_email: "usertest4@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678911,
      user_gender_id: gender[0].gender_id,
    };

    const insertUserResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    const tokenResponse = await request(app).post("/auth/login").send({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const { token } = tokenResponse.body;

    await dbConnection<UserEntity>("tb_users")
      .where({
        user_id: insertUserResponse[0].user_id,
      })
      .del();

    const response = await request(app)
      .delete(`/account/user/me`)
      .query({
        user_password: user.user_password,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_NOT_FOUND);
  });

  it("should not be able to delete a user if it is not authenticated", async () => {
    const response = await request(app).delete(`/account/user/1`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
