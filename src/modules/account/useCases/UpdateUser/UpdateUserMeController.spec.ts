import request from "supertest";

import testConfig from "@config/test";

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

let hashProvider: BcryptjsHashProvider;

describe("Update User Me Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should not be able to update an user with incorrect password", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 3",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Genders not created");
    }

    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "N2",
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
        neighborhood_name: "New Neighborhood 3",
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
      user_cpf: 12345678911,
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

    const tokenResponse = await request(app).post("/auth/login").send({
      user_email: user.user_email,
      user_password: user.user_password,
    });

    const token = tokenResponse.body.token;

    const userUpdate = {
      user_name: "User Test Update 2",
      user_password: "incorrect_password",
    };

    const response = await request(app)
      .patch(`/account/user/me`)
      .send(userUpdate)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      AppErrorMessages.USER_INCORRECT_PASSWORD,
    );
  });
});
