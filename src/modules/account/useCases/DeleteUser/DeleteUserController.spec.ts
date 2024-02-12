import request from "supertest";
import { v4 as uuid } from "uuid";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";
import auth from "@config/auth";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

let hashProvider: BcryptjsHashProvider;

let dateProvider: DayjsDateProvider;

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Delete User Controller", () => {
  beforeAll(async () => {
    hashProvider = new BcryptjsHashProvider();
    cacheProvider = new RedisCacheProvider();
    dateProvider = new DayjsDateProvider();

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

  it("should be able to delete a user with an admin request and erase cache", async () => {
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

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    await dbConnection<AddressEntity>("tb_addresses").insert({
      user_address_id: userInsertResponse[0].user_id,
      address_street: "Street Test",
      address_number: 123,
      address_neighborhood_id: neighborhood[0].neighborhood_id,
      address_zip_code: 12345678,
    });

    await dbConnection<PhoneEntity>("tb_phones").insert({
      user_phone_id: userInsertResponse[0].user_id,
      phone_number: 999999999,
      phone_ddd: 34,
    });

    const refreshToken = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .insert({
        refresh_token_user_id: userInsertResponse[0].user_id,
        refresh_token_id: uuid(),
        refresh_token_expires_in: dateProvider.addDays(
          Number(auth.refresh.expiresInDays),
        ),
      })
      .returning("*");

    if (!refreshToken[0]) {
      throw new Error("Refresh token not created");
    }

    await cacheProvider.cacheSet({
      key: `${cachePrefixes.refreshToken}:${refreshToken[0].refresh_token_id}`,
      value: JSON.stringify({
        user_id: userInsertResponse[0].user_id,
        user_name: user.user_name,
        user_role: "Role user",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
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

    const response = await request(app)
      .delete(`/account/user/${userInsertResponse[0].user_id}`)
      .set({
        Authorization: `Bearer ${token}`,
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
      `${cachePrefixes.refreshToken}:${refreshToken[0].refresh_token_id}`,
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

  it("should not be able to delete a user if it does not exists", async () => {
    const response = await request(app)
      .delete(`/account/user/999999`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_NOT_FOUND);
  });

  it("should not be able to delete another user if the current user is not an admin", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const tokenUser = loginResponse.body.token;

    const response = await request(app)
      .delete(`/account/user/1`)
      .query({
        user_password: "12345678",
      })
      .set({
        Authorization: `Bearer ${tokenUser}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to delete a user if it is not authenticated", async () => {
    const response = await request(app).delete(`/account/user/1`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
