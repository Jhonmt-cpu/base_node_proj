import request from "supertest";

import testConfig from "@config/test";
import { cachePrefixes } from "@config/cache";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";

let hashProvider: BcryptjsHashProvider;

let cacheProvider: RedisCacheProvider;

let token: string;

describe("Update User Controller", () => {
  beforeAll(async () => {
    hashProvider = new BcryptjsHashProvider();
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

  it("should be able to update a user with an admin request and create cache", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender",
      })
      .returning("*");

    const gender2 = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    if (!gender[0] || !gender2[0]) {
      throw new Error("Genders not created");
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

    const neighborhood2 = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .insert({
        neighborhood_name: "New Neighborhood 2",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0] || !neighborhood2[0]) {
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

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const address = await dbConnection<AddressEntity>("tb_addresses")
      .insert({
        user_address_id: userInsertResponse[0].user_id,
        address_street: "Street Test",
        address_number: 123,
        address_neighborhood_id: neighborhood[0].neighborhood_id,
        address_zip_code: 12345678,
      })
      .returning("*");

    if (!address[0]) {
      throw new Error("Address not created");
    }

    const phone = await dbConnection<PhoneEntity>("tb_phones")
      .insert({
        user_phone_id: userInsertResponse[0].user_id,
        phone_number: 999999999,
        phone_ddd: 34,
      })
      .returning("*");

    if (!phone[0]) {
      throw new Error("Phone not created");
    }

    const cacheGetUserKey = `${cachePrefixes.getUser}:${userInsertResponse[0].user_id}`;

    const cacheListAllUsersPaginatedKey = `${cachePrefixes.listAllUsersPaginated}:page:1:limit:10`;

    const cacheGetUserPhone = `${cachePrefixes.getUserPhone}:${userInsertResponse[0].user_id}`;

    const cacheGetUserAddress = `${cachePrefixes.getUserAddress}:${userInsertResponse[0].user_id}`;

    await cacheProvider.cacheSet({
      key: cacheGetUserKey,
      value: JSON.stringify(userInsertResponse[0]),
      expiresInSeconds: 60 * 60 * 24,
    });

    await cacheProvider.cacheSet({
      key: cacheListAllUsersPaginatedKey,
      value: JSON.stringify([]),
      expiresInSeconds: 60 * 60 * 24,
    });

    await cacheProvider.cacheSet({
      key: cacheGetUserPhone,
      value: JSON.stringify({}),
      expiresInSeconds: 60 * 60 * 24,
    });

    await cacheProvider.cacheSet({
      key: cacheGetUserAddress,
      value: JSON.stringify({}),
      expiresInSeconds: 60 * 60 * 24,
    });

    const cacheGetUserBefore = await cacheProvider.cacheGet(cacheGetUserKey);

    const cacheListAllUsersPaginatedBefore = await cacheProvider.cacheGet(
      cacheListAllUsersPaginatedKey,
    );

    const cacheGetUserPhoneBefore = await cacheProvider.cacheGet(
      cacheGetUserPhone,
    );

    const cacheGetUserAddressBefore = await cacheProvider.cacheGet(
      cacheGetUserAddress,
    );

    const userUpdate = {
      user_name: "User Test Update",
      user_email: "usertesteupdate@email.com",
      user_new_password: "87654321",
      user_gender_id: gender2[0].gender_id,
      user_phone: "31998110950",
      user_address: {
        address_street: "Street Test Update",
        address_number: 321,
        address_complement: "Complement Test Update",
        address_neighborhood_id: neighborhood2[0].neighborhood_id,
        address_zip_code: "87654321",
      },
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    const userAfterUpdate = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!userAfterUpdate) {
      throw new Error("User not found");
    }

    const userWithDateStrings = Object.assign(userAfterUpdate, {
      user_birth_date: userAfterUpdate.user_birth_date.toISOString(),
      user_created_at: userAfterUpdate.user_created_at.toISOString(),
      user_updated_at: userAfterUpdate.user_updated_at.toISOString(),
    });

    const addressAfterUpdate = await dbConnection<AddressEntity>("tb_addresses")
      .select("*")
      .where({
        user_address_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!addressAfterUpdate) {
      throw new Error("Address not found");
    }

    const addressWithDateStrings = Object.assign(addressAfterUpdate, {
      address_updated_at: addressAfterUpdate.address_updated_at.toISOString(),
    });

    const phoneAfterUpdate = await dbConnection<PhoneEntity>("tb_phones")
      .select("*")
      .where({
        user_phone_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!phoneAfterUpdate) {
      throw new Error("Phone not found");
    }

    const cacheGetUserAfter = await cacheProvider.cacheGet(cacheGetUserKey);

    const cacheListAllUsersPaginatedAfter = await cacheProvider.cacheGet(
      cacheListAllUsersPaginatedKey,
    );

    const cacheGetUserPhoneAfter = await cacheProvider.cacheGet(
      cacheGetUserPhone,
    );

    const cacheGetUserAddressAfter = await cacheProvider.cacheGet(
      cacheGetUserAddress,
    );

    const phoneWithDateStrings = Object.assign(phoneAfterUpdate, {
      phone_updated_at: phoneAfterUpdate.phone_updated_at.toISOString(),
    });

    const {
      user_password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_cpf,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_role_id,
      ...userWithDateStringsProperties
    } = userWithDateStrings;

    const userUpdateExpected = {
      ...userWithDateStringsProperties,
      user_address: addressWithDateStrings,
      user_phone: phoneWithDateStrings,
    };

    const passwordMatch = await hashProvider.compareHash(
      userUpdate.user_new_password,
      user_password,
    );

    expect(response.status).toBe(200);
    expect(passwordMatch).toBe(true);
    expect(response.body).toEqual(userUpdateExpected);
    expect(cacheGetUserBefore).not.toBeNull();
    expect(cacheListAllUsersPaginatedBefore).not.toBeNull();
    expect(cacheGetUserPhoneBefore).not.toBeNull();
    expect(cacheGetUserAddressBefore).not.toBeNull();
    expect(cacheGetUserAfter).toBeNull();
    expect(cacheListAllUsersPaginatedAfter).toBeNull();
    expect(cacheGetUserPhoneAfter).toBeNull();
    expect(cacheGetUserAddressAfter).toBeNull();
  });

  it("should not be able to update a non existing user", async () => {
    const userUpdate = {
      user_name: "User Test Update 2",
    };

    const response = await request(app)
      .patch(`/account/user/9999`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_NOT_FOUND);
  });

  it("should not be able to update the user email if it already belongs to another user", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 4",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 3",
        state_uf: "N2",
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
        neighborhood_name: "New Neighborhood 4",
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
      user_cpf: 12345678912,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const { user_test } = testConfig;

    const userUpdate = {
      user_name: "User Test Update 3",
      user_email: user_test.user_email,
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      AppErrorMessages.USER_EMAIL_ALREADY_IN_USE,
    );
  });

  it("should not be able to update user gender if it does not exists", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 5",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 4",
        state_uf: "N2",
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
        neighborhood_name: "New Neighborhood 5",
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
      user_cpf: 12345678913,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const userUpdate = {
      user_name: "User Test Update 4",
      user_gender_id: 9999,
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.GENDER_NOT_FOUND);
  });

  it("should not be able to update user phone if it already belongs to another user", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 6",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 5",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 5",
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
        neighborhood_name: "New Neighborhood 6",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 5",
      user_email: "usertest5@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678914,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const { phone_test } = testConfig;

    const userUpdate = {
      user_name: "User Test Update 5",
      user_phone: `${phone_test.phone_ddd}${phone_test.phone_number}`,
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      AppErrorMessages.USER_PHONE_ALREADY_IN_USE,
    );
  });

  it("should not be able to update user phone if it does not exists", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 7",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 8",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 6",
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
        neighborhood_name: "New Neighborhood 7",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 6",
      user_email: "usertest6@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678915,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const userUpdate = {
      user_name: "User Test Update 6",
      user_phone: "34999999999",
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_PHONE_NOT_FOUND);
  });

  it("should not be able to update user address if it doesn't exists", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 8",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 9",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 7",
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
        neighborhood_name: "New Neighborhood 8",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 7",
      user_email: "usertest7@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678916,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const userUpdate = {
      user_name: "User Test Update 7",
      user_address: {
        address_street: "Street Test Update 7",
      },
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_ADDRESS_NOT_FOUND);
  });

  it("should not be able to update user address if neighborhood doesn't exists", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 9",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 10",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 8",
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
        neighborhood_name: "New Neighborhood 9",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 8",
      user_email: "usertest8@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678917,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    await dbConnection<AddressEntity>("tb_addresses").insert({
      user_address_id: userInsertResponse[0].user_id,
      address_street: "Street Test 8",
      address_number: 123,
      address_neighborhood_id: neighborhood[0].neighborhood_id,
      address_zip_code: 12345678,
    });

    const userUpdate = {
      user_name: "User Test Update 8",
      user_address: {
        address_street: "Street Test Update 8",
        address_neighborhood_id: 9999,
      },
    };

    const response = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.NEIGHBORHOOD_NOT_FOUND);
  });

  it("should not update an user property if it is undefined or the same as the current name", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 10",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 11",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 9",
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
        neighborhood_name: "New Neighborhood 10",
        neighborhood_city_id: city[0].city_id,
      })
      .returning("*");

    if (!neighborhood[0]) {
      throw new Error("Neighborhood not created");
    }

    const user = {
      user_name: "User Test 9",
      user_email: "usertest9@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678918,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const address = await dbConnection<AddressEntity>("tb_addresses")
      .insert({
        user_address_id: userInsertResponse[0].user_id,
        address_street: "Street Test 9",
        address_complement: "Complement Test 9",
        address_number: 123,
        address_neighborhood_id: neighborhood[0].neighborhood_id,
        address_zip_code: 12345678,
      })
      .returning("*");

    if (!address[0]) {
      throw new Error("Address not created");
    }

    const phone = await dbConnection<PhoneEntity>("tb_phones")
      .insert({
        user_phone_id: userInsertResponse[0].user_id,
        phone_number: 999999910,
        phone_ddd: 34,
      })
      .returning("*");

    if (!phone[0]) {
      throw new Error("Phone not created");
    }

    const userUpdateSameData = {
      user_name: user.user_name,
      user_email: user.user_email,
      user_gender_id: gender[0].gender_id,
      user_phone: `${phone[0].phone_ddd}${phone[0].phone_number}`,
      user_address: {
        address_street: address[0].address_street,
        address_number: address[0].address_number,
        address_complement: address[0].address_complement,
        address_neighborhood_id: address[0].address_neighborhood_id,
        address_zip_code: address[0].address_zip_code.toString(),
      },
    };

    const userUpdatedSameDataResponse = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdateSameData)
      .set("Authorization", `Bearer ${token}`);

    const userAfterUpdateSameData = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!userAfterUpdateSameData) {
      throw new Error("User not found");
    }

    const addressAfterUpdateSameData = await dbConnection<AddressEntity>(
      "tb_addresses",
    )
      .select("*")
      .where({
        user_address_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!addressAfterUpdateSameData) {
      throw new Error("Address not found");
    }

    const phoneAfterUpdateSameData = await dbConnection<PhoneEntity>(
      "tb_phones",
    )
      .select("*")
      .where({
        user_phone_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!phoneAfterUpdateSameData) {
      throw new Error("Phone not found");
    }

    expect(userUpdatedSameDataResponse.status).toBe(200);
    expect(userUpdatedSameDataResponse.body).toEqual({
      user_id: userInsertResponse[0].user_id,
    });
    expect(userInsertResponse[0]).toEqual(userAfterUpdateSameData);
    expect(address[0]).toEqual(addressAfterUpdateSameData);
    expect(phone[0]).toEqual(phoneAfterUpdateSameData);

    const userUpdateUndefined = {};

    const userUpdatedUndefined = await request(app)
      .patch(`/account/user/${userInsertResponse[0].user_id}`)
      .send(userUpdateUndefined)
      .set("Authorization", `Bearer ${token}`);

    const userAfterUpdateUndefined = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!userAfterUpdateUndefined) {
      throw new Error("User not found");
    }

    const addressAfterUpdateUndefined = await dbConnection<AddressEntity>(
      "tb_addresses",
    )
      .select("*")
      .where({
        user_address_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!addressAfterUpdateUndefined) {
      throw new Error("Address not found");
    }

    const phoneAfterUpdateUndefined = await dbConnection<PhoneEntity>(
      "tb_phones",
    )
      .select("*")
      .where({
        user_phone_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!phoneAfterUpdateUndefined) {
      throw new Error("Phone not found");
    }

    expect(userUpdatedUndefined.status).toBe(200);
    expect(userUpdatedUndefined.body).toEqual({
      user_id: userInsertResponse[0].user_id,
    });
    expect(userInsertResponse[0]).toEqual(userAfterUpdateUndefined);
    expect(address[0]).toEqual(addressAfterUpdateUndefined);
    expect(phone[0]).toEqual(phoneAfterUpdateUndefined);
  });

  it("should not be able to update a user with an user request", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const { token: normalToken } = loginResponse.body;

    const userUpdate = {
      user_name: "User Test Update 10",
    };

    const response = await request(app)
      .patch(`/account/user/1`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${normalToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to update an user without authentication", async () => {
    const userUpdate = {
      user_name: "User Test Update 11",
    };

    const response = await request(app)
      .patch(`/account/user/1`)
      .send(userUpdate);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
