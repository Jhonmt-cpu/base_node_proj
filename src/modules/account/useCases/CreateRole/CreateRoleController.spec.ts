import request from "supertest";

import testConfig from "@config/test";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let token: string;

describe("Create Role Controller", () => {
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

  it("should be able to create a new role", async () => {
    const response = await request(app)
      .post("/account/role")
      .send({
        role_name: "New Role",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("role_id");
  });

  it("should not be able to create a role if name already exists", async () => {
    const insertResponse = await dbConnection<RoleEntity>("tb_roles")
      .insert({
        role_name: "New Role 2",
      })
      .returning("*");

    const role = insertResponse[0];

    const response = await request(app)
      .post("/account/role")
      .send({
        role_name: role.role_name,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.ROLE_ALREADY_EXISTS);
  });

  it("should not be able to create a role with normal user", async () => {
    const { user_test } = testConfig;

    const loginResponse = await request(app).post("/auth/login").send({
      user_email: user_test.user_email,
      user_password: user_test.user_password,
    });

    const tokenUser = loginResponse.body.token;

    const response = await request(app)
      .post("/account/role")
      .send({
        role_name: "New Role",
      })
      .set({
        Authorization: `Bearer ${tokenUser}`,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to create a role without a logged user", async () => {
    const response = await request(app).post("/account/role").send({
      role_name: "New Role",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
