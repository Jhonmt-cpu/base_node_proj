import request from "supertest";

import testConfig from "@config/test";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";

import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

let token: string;

describe("List All Genders Paginated Controller", () => {
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

  it("should be able to list all genders paginated", async () => {
    const gendersToInsert = [];

    for (let i = 0; i < 15; i++) {
      gendersToInsert.push({
        gender_name: `Gender ${i}`,
      });
    }

    await dbConnection<GenderEntity>("tb_genders").insert(gendersToInsert);

    const allGenders = await dbConnection<GenderEntity>("tb_genders").select(
      "*",
    );

    const allGendersWithDateStrings = allGenders.map((gender) => ({
      ...gender,
      gender_created_at: gender.gender_created_at.toISOString(),
    }));

    const response10 = await request(app)
      .get("/account/gender")
      .query({
        page: 1,
        limit: 10,
      })
      .set("Authorization", `Bearer ${token}`);

    const response20 = await request(app)
      .get("/account/gender")
      .query({
        page: 1,
        limit: 20,
      })
      .set("Authorization", `Bearer ${token}`);

    const response7 = await request(app)
      .get("/account/gender")
      .query({
        page: 2,
        limit: 7,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response10.status).toBe(200);
    expect(response10.body).toEqual(allGendersWithDateStrings.slice(0, 10));
    expect(response20.status).toBe(200);
    expect(response20.body).toEqual(allGendersWithDateStrings.slice(0, 20));
    expect(response7.status).toBe(200);
    expect(response7.body).toEqual(allGendersWithDateStrings.slice(7, 14));
  });

  it("should not be able to list all genders paginated with a normal user", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken } = authResponse.body;

    const response = await request(app)
      .get("/account/gender")
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

  it("should not be able to list all genders paginated without authentication", async () => {
    const response = await request(app).get("/account/gender").query({
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
