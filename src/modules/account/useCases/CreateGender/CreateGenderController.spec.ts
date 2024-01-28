import request from "supertest";

import testConfig from "@config/test";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let token: string;

describe("Create Gender Controller", () => {
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

  it("should be able to create a new gender", async () => {
    const response = await request(app)
      .post("/account/gender")
      .send({
        gender_name: "New Gender",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("gender_id");
  });

  it("should not be able to create a gender if name already exists", async () => {
    const insertResponse = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    const gender = insertResponse[0];

    const response = await request(app)
      .post("/account/gender")
      .send({
        gender_name: gender.gender_name,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.GENDER_ALREADY_EXISTS);
  });

  it("should not be able to create a new gender with a normal user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post("/account/gender")
      .send({
        gender_name: "New Gender",
      })
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to create a new gender without a logged user", async () => {
    const response = await request(app).post("/account/gender").send({
      gender_name: "New Gender",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
