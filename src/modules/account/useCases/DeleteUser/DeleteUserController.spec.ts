import request from "supertest";
import { v4 as uuid } from "uuid";

import testConfig from "@config/test";

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
import auth from "@config/auth";

let hashProvider: BcryptjsHashProvider;

let dateProvider: DayjsDateProvider;

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Delete User Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
    cacheProvider = new RedisCacheProvider();
    dateProvider = new DayjsDateProvider();
  });

  beforeEach(async () => {
    const { user_test_admin } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test_admin.user_email,
      user_password: user_test_admin.user_password,
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to delete a user with an admin request", async () => {
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
      key: `${auth.refresh.cachePrefix}:${refreshToken[0].refresh_token_id}`,
      value: JSON.stringify({
        user_id: userInsertResponse[0].user_id,
        user_name: user.user_name,
        user_role: "Role user",
      }),
      expiresInSeconds: Number(auth.refresh.expiresInDays) * 24 * 60 * 60,
    });

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
      `${auth.refresh.cachePrefix}:${refreshToken[0].refresh_token_id}`,
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

    expect(response.status).toBe(204);
    expect(userDeleted).toBeUndefined();
    expect(refreshTokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
  });

  it("should be able to delete a user with the password", async () => {
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
      `${auth.refresh.cachePrefix}:${refresh_token}`,
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

    expect(response.status).toBe(204);
    expect(userDeleted).toBeUndefined();
    expect(refreshTokensDeleted).toHaveLength(0);
    expect(refreshTokenCacheDeleted).toBeNull();
    expect(userPhoneDeleted).toBeUndefined();
    expect(userAddressDeleted).toBeUndefined();
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
      `${auth.refresh.cachePrefix}:${refresh_token}`,
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
});
