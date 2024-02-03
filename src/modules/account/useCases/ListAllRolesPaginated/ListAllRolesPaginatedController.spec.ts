import request from "supertest";

import testConfig from "@config/test";

import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let token: string;

describe("List All Roles Paginated Controller", () => {
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

  it("should be able to list all roles paginated", async () => {
    const rolesToInsert = [];

    for (let i = 0; i < 15; i++) {
      rolesToInsert.push({
        role_name: `Role ${i}`,
      });
    }

    await dbConnection<RoleEntity>("tb_roles").insert(rolesToInsert);

    const allRoles = await dbConnection<RoleEntity>("tb_roles").select("*");

    const allRolesWithDateStrings = allRoles.map((role) => ({
      ...role,
      role_created_at: role.role_created_at.toISOString(),
    }));

    const response10 = await request(app)
      .get("/account/role")
      .query({
        page: 1,
        limit: 10,
      })
      .set("Authorization", `Bearer ${token}`);

    const response20 = await request(app)
      .get("/account/role")
      .query({
        page: 1,
        limit: 20,
      })
      .set("Authorization", `Bearer ${token}`);

    const response7 = await request(app)
      .get("/account/role")
      .query({
        page: 2,
        limit: 7,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response10.status).toBe(200);
    expect(response10.body).toEqual(allRolesWithDateStrings.slice(0, 10));
    expect(response20.status).toBe(200);
    expect(response20.body).toEqual(allRolesWithDateStrings.slice(0, 20));
    expect(response7.status).toBe(200);
    expect(response7.body).toEqual(allRolesWithDateStrings.slice(7, 14));
  });

  it("should not be able to list all roles paginated with a normal user", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken } = authResponse.body;

    const response = await request(app)
      .get("/account/role")
      .query({
        page: 1,
        limit: 10,
      })
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      AppErrorMessages.ACCESS_DENIED_HAS_NO_PERMISSION,
    );
  });

  it("should not be able to list all roles paginated without authentication", async () => {
    const response = await request(app).get("/account/role").query({
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
