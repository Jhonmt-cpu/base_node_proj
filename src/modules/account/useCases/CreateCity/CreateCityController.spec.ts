import request from "supertest";

import testConfig from "@config/test";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";

let token: string;

describe("Create City Controller", () => {
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

  it("should be able to create a new city", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City",
        city_state_id: state[0].state_id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("city_id");
  });

  it("should not be able to create a new city with invalid state", async () => {
    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City",
        city_state_id: 999,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("State not found!");
  });

  it("should not be able to create a new city with same name and state", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    await dbConnection<CityEntity>("tb_cities").insert({
      city_name: "New City 2",
      city_state_id: state[0].state_id,
    });

    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City 2",
        city_state_id: state[0].state_id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("City already exists!");
  });

  it("should not be able to create a new city with a normal user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post("/account/city")
      .send({
        city_name: "New City",
        city_state_id: 1,
      })
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(403);
  });

  it("should not be able to create a new city without a logged user", async () => {
    const response = await request(app).post("/account/city").send({
      city_name: "New City",
      city_state_id: 1,
    });

    expect(response.status).toBe(401);
  });
});
