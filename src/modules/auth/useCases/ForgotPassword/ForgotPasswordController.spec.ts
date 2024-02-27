import request from "supertest";
import { v4 as uuid } from "uuid";

import { ResetTokenRepository } from "@modules/auth/infra/knex/repositories/ResetTokenRepository";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { ResetTokenEntity } from "@modules/auth/infra/knex/entities/ResetTokenEntity";

import { redisRateLimiterClient } from "@utils/redisRateLimiter";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { EtherealMailProvider } from "@shared/container/providers/MailProvider/implementations/EtherealMailProvider";

describe("Forgot Password Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    redisRateLimiterClient.disconnect();
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to send a forgot password email", async () => {
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

    const oldToken = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .insert({
        reset_token_id: uuid(),
        reset_token_user_id: userInsertResponse[0].user_id,
        reset_token_expires_in: new Date(),
      })
      .returning("*");

    const mailProvider =
      process.env.MAIL_PROVIDER === "ethereal"
        ? EtherealMailProvider.prototype
        : //Change the EtherealMailProvider to the correct provider
          EtherealMailProvider.prototype;

    const spyOnEmail = jest
      .spyOn(mailProvider, "sendMail")
      .mockResolvedValue(undefined);

    const spyOnGenerateToken = jest.spyOn(
      ResetTokenRepository.prototype,
      "create",
    );

    const response = await request(app).post("/auth/forgot").send({
      user_email: user.user_email,
    });

    const tokenDeleted = await dbConnection<ResetTokenEntity>("tb_reset_tokens")
      .where({
        reset_token_id: oldToken[0].reset_token_id,
      })
      .first();

    expect(response.status).toBe(204);
    expect(spyOnEmail).toHaveBeenCalled();
    expect(spyOnGenerateToken).toHaveBeenCalled();
    expect(tokenDeleted).toBeUndefined();
  });

  it("should not be able to send a forgot password email to a non existing user", async () => {
    const mailProvider =
      process.env.MAIL_PROVIDER === "ethereal"
        ? EtherealMailProvider.prototype
        : //Change the EtherealMailProvider to the correct provider
          EtherealMailProvider.prototype;

    const spyOnEmail = jest
      .spyOn(mailProvider, "sendMail")
      .mockResolvedValue(undefined);

    const spyOnGenerateToken = jest.spyOn(
      ResetTokenRepository.prototype,
      "create",
    );

    const response = await request(app).post("/auth/forgot").send({
      user_email: "nonexistinguser@email.com",
    });

    expect(response.status).toBe(204);
    expect(spyOnEmail).not.toHaveBeenCalled();
    expect(spyOnGenerateToken).not.toHaveBeenCalled();
  });
});
