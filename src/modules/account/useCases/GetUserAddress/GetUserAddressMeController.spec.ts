import request from "supertest";

import testConfig from "@config/test";

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

let hashProvider: BcryptjsHashProvider;

describe("Get User Address Me Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to get a user address with authentication", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken, user } = authResponse.body;

    const response = await request(app)
      .get(`/account/user/me/address`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user_address_id");
    expect(response.body.user_address_id).toBe(user.user_id);
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
