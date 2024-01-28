import request from "supertest";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import test from "@config/test";

describe("Create User Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to create a new user", async () => {
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

    const response = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User",
        user_email: "newuser@email.com",
        user_password: "12345678",
        user_cpf: "70498249093",
        user_gender_id: gender[0].gender_id,
        user_birth_date: "2001-01-01",
        user_phone: "34999999999",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: neighborhood[0].neighborhood_id,
          address_zip_code: "12345678",
        },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user_id");
  });

  it("should not be able to create a new user with invalid birth date", async () => {
    const responseOverAge = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User",
        user_email: "newuser@email.com",
        user_password: "12345678",
        user_cpf: "70498249093",
        user_gender_id: 999,
        user_birth_date: "1900-01-01",
        user_phone: "34999999999",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: 999,
          address_zip_code: "12345678",
        },
      });

    const responseUnderAge = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User",
        user_email: "newuser@email.com",
        user_password: "12345678",
        user_cpf: "70498249093",
        user_gender_id: 999,
        user_birth_date: new Date().toISOString().split("T")[0],
        user_phone: "34999999999",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: 999,
          address_zip_code: "12345678",
        },
      });

    expect(responseOverAge.status).toBe(400);
    expect(responseOverAge.body.message).toBe(
      AppErrorMessages.USER_INVALID_AGE,
    );
    expect(responseUnderAge.status).toBe(400);
    expect(responseUnderAge.body.message).toBe(
      AppErrorMessages.USER_INVALID_AGE,
    );
  });

  it("should not be able to create a user with invalid gender", async () => {
    const response = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User",
        user_email: "newuser@email.com",
        user_password: "12345678",
        user_cpf: "70498249093",
        user_gender_id: 999,
        user_birth_date: "2001-01-01",
        user_phone: "34999999999",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: 999,
          address_zip_code: "12345678",
        },
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.GENDER_NOT_FOUND);
  });

  it("should not be able to create a user with invalid neighborhood", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const response = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User",
        user_email: "newuser@email.com",
        user_password: "12345678",
        user_cpf: "70498249093",
        user_gender_id: gender[0].gender_id,
        user_birth_date: "2001-01-01",
        user_phone: "34999999999",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: 999,
          address_zip_code: "12345678",
        },
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.NEIGHBORHOOD_NOT_FOUND);
  });

  it("should not be able to create a user with same phone number", async () => {
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

    const { phone_test } = test;

    const response = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User",
        user_email: "newuser@email.com",
        user_password: "12345678",
        user_cpf: "70498249093",
        user_gender_id: gender[0].gender_id,
        user_birth_date: "2001-01-01",
        user_phone: `${phone_test.phone_ddd}${phone_test.phone_number}`,
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: neighborhood[0].neighborhood_id,
          address_zip_code: "12345678",
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      AppErrorMessages.USER_PHONE_ALREADY_EXISTS,
    );
  });

  it("should not be able to create a user with same email or cpf", async () => {
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

    const { user_test } = test;

    const responseSameEmail = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User 2",
        user_email: user_test.user_email,
        user_password: "12345678",
        user_cpf: "35294292017",
        user_gender_id: gender[0].gender_id,
        user_birth_date: "2001-01-01",
        user_phone: "34999999998",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: neighborhood[0].neighborhood_id,
          address_zip_code: "12345678",
        },
      });

    const responseSameCpf = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User 2",
        user_email: "newuser2@email.com",
        user_password: "12345678",
        user_cpf: user_test.user_cpf.toString(),
        user_gender_id: gender[0].gender_id,
        user_birth_date: "2001-01-01",
        user_phone: "34999999998",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: neighborhood[0].neighborhood_id,
          address_zip_code: "12345678",
        },
      });

    const responseSameEmailAndCpf = await request(app)
      .post("/account/user")
      .send({
        user_name: "New User 2",
        user_email: user_test.user_email,
        user_password: "12345678",
        user_cpf: user_test.user_cpf.toString(),
        user_gender_id: gender[0].gender_id,
        user_birth_date: "2001-01-01",
        user_phone: "34999999998",
        user_address: {
          address_street: "Street Test",
          address_number: 123,
          address_complement: "Complement Test",
          address_neighborhood_id: neighborhood[0].neighborhood_id,
          address_zip_code: "12345678",
        },
      });

    expect(responseSameEmail.status).toBe(400);
    expect(responseSameEmail.body.message).toBe(
      AppErrorMessages.USER_ALREADY_EXISTS,
    );
    expect(responseSameCpf.status).toBe(400);
    expect(responseSameCpf.body.message).toBe(
      AppErrorMessages.USER_ALREADY_EXISTS,
    );
    expect(responseSameEmailAndCpf.status).toBe(400);
    expect(responseSameEmailAndCpf.body.message).toBe(
      AppErrorMessages.USER_ALREADY_EXISTS,
    );
  });
});
