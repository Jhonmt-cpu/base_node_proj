import request from "supertest";
import { v4 as uuid } from "uuid";

import auth from "@config/auth";

import { ResetTokenEntity } from "@modules/auth/infra/knex/entities/ResetTokenEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { UserRepository } from "@modules/account/infra/knex/repositories/UserRepository";

let hashProvider: IHashProvider;

let dateProvider: DayjsDateProvider;

describe("Reset Password Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
    dateProvider = new DayjsDateProvider();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to reset password", async () => {
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

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert(user)
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const resetToken = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .insert({
        reset_token_id: uuid(),
        reset_token_user_id: userInsertResponse[0].user_id,
        reset_token_expires_in: dateProvider.addMinutes(
          Number(auth.forgotPassword.expiresInMinutes),
        ),
      })
      .returning("*");

    const newPassword = "new_password";

    const response = await request(app).post("/auth/reset").send({
      reset_token: resetToken[0].reset_token_id,
      new_password: newPassword,
    });

    const tokenAfter = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .select("*")
      .where({
        reset_token_id: resetToken[0].reset_token_id,
      })
      .first();

    const userUpdated = await dbConnection<UserEntity>("tb_users")
      .select("*")
      .where({
        user_id: userInsertResponse[0].user_id,
      })
      .first();

    if (!userUpdated) {
      throw new Error("User not found");
    }

    const passwordMatch = await hashProvider.compareHash(
      newPassword,
      userUpdated.user_password,
    );

    expect(response.status).toBe(204);
    expect(passwordMatch).toBe(true);
    expect(tokenAfter).toBeUndefined();
  });

  it("should not be able to reset password with an invalid token", async () => {
    const newPassword = "new_password";

    const response = await request(app).post("/auth/reset").send({
      reset_token: uuid(),
      new_password: newPassword,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.RESET_TOKEN_INVALID);
  });

  it("should not be able to reset password with an expired token", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 2",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const user = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_birth_date: new Date(),
      user_password: "123456789",
      user_cpf: 12345678911,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert(user)
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const resetToken = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .insert({
        reset_token_id: uuid(),
        reset_token_user_id: userInsertResponse[0].user_id,
        reset_token_expires_in: dateProvider.addMinutes(
          -Number(auth.forgotPassword.expiresInMinutes),
        ),
      })
      .returning("*");

    const response = await request(app).post("/auth/reset").send({
      reset_token: resetToken[0].reset_token_id,
      new_password: "new_password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(AppErrorMessages.RESET_TOKEN_EXPIRED);
  });

  it("should not be able to reset password if the user does not exist", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender 3",
      })
      .returning("*");

    if (!gender[0]) {
      throw new Error("Gender not created");
    }

    const user = {
      user_name: "User Test 3",
      user_email: "usertest3@test.com",
      user_birth_date: new Date(),
      user_password: "123456789",
      user_cpf: 12345678912,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert(user)
      .returning("*");

    if (!userInsertResponse[0]) {
      throw new Error("User not created");
    }

    const resetToken = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .insert({
        reset_token_id: uuid(),
        reset_token_user_id: userInsertResponse[0].user_id,
        reset_token_expires_in: dateProvider.addMinutes(
          Number(auth.forgotPassword.expiresInMinutes),
        ),
      })
      .returning("*");

    const spyOnUser = jest
      .spyOn(UserRepository.prototype, "findById")
      .mockResolvedValue(undefined);

    const response = await request(app).post("/auth/reset").send({
      reset_token: resetToken[0].reset_token_id,
      new_password: "new_password",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.USER_NOT_FOUND);
    expect(spyOnUser).toHaveBeenCalledWith(userInsertResponse[0].user_id);
  });
});
