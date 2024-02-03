import request from "supertest";

import testConfig from "@config/test";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let token: string;

describe("Get User Complete Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
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

  it("should be able to get a user complete with an admin request", async () => {
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
      .insert(user)
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const userAddressInsertResponse = await dbConnection<AddressEntity>(
      "tb_addresses",
    )
      .insert({
        address_street: "New Street",
        address_number: 123,
        address_neighborhood_id: neighborhood[0].neighborhood_id,
        user_address_id: userInsertResponse[0].user_id,
        address_zip_code: 12345678,
      })
      .returning("*");

    if (!userAddressInsertResponse[0]) {
      throw new Error("User Address not created");
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

    const response = await request(app)
      .get(`/account/user/${userInsertResponse[0].user_id}/complete`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("address");
    expect(response.body).toHaveProperty("phone");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body.user_id).toBe(userInsertResponse[0].user_id);
  });

  it("should not be able to get a user complete with an admin request if user does not exist", async () => {
    const response = await request(app)
      .get(`/account/user/99999/complete`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_NOT_FOUND);
  });

  it("should not be able to get a user complete with a normal user request", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const tokenUser = loginResponse.body.token;

    const response = await request(app)
      .get(`/account/user/1/complete`)
      .set({
        Authorization: `Bearer ${tokenUser}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to get a user complete without authentication", async () => {
    const response = await request(app).get(`/account/user/1/complete`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
