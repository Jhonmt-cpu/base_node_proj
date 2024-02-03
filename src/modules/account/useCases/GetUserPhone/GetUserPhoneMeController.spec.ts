import request from "supertest";

import testConfig from "@config/test";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

let hashProvider: BcryptjsHashProvider;

describe("Get User Phone Me Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to get a user phone with authentication", async () => {
    const { user_email, user_password } = testConfig.user_test;

    const authResponse = await request(app).post("/auth/login").send({
      user_email,
      user_password,
    });

    const { token: userToken, user } = authResponse.body;

    const response = await request(app)
      .get(`/account/user/me/phone`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user_phone_id");
    expect(response.body.user_phone_id).toBe(user.user_id);
  });

  it("should not be able to get a non existing user", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
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
      .get(`/account/user/me/phone`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_PHONE_NOT_FOUND);
  });

  it("should not be able to get a user phone without authentication", async () => {
    const response = await request(app).get(`/account/user/me/phone`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AppErrorMessages.TOKEN_MISSING);
  });
});
