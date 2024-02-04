import request from "supertest";
import { v4 as uuid } from "uuid";

import testConfig from "@config/test";

import auth from "@config/auth";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { RefreshTokenEntity } from "@modules/auth/infra/knex/entities/RefreshTokenEntity";
import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";

import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { RedisCacheProvider } from "@shared/container/providers/CacheProvider/implementations/RedisCacheProvider";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

let dateProvider: DayjsDateProvider;

let cacheProvider: RedisCacheProvider;

let hashProvider: BcryptjsHashProvider;

let token: string;

describe("Synchronize Cache Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();

    hashProvider = new BcryptjsHashProvider();
    dateProvider = new DayjsDateProvider();
    cacheProvider = new RedisCacheProvider();
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

  it("should be able to synchronize cache", async () => {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: "New Gender",
      })
      .returning("*");

    const user = {
      user_name: "User Test",
      user_email: "usertest@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678910,
      user_gender_id: gender[0].gender_id,
    };

    const user2 = {
      user_name: "User Test 2",
      user_email: "usertest2@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678911,
      user_gender_id: gender[0].gender_id,
    };

    const user3 = {
      user_name: "User Test 3",
      user_email: "usertest3@test.com",
      user_birth_date: new Date(),
      user_password: "12345678",
      user_cpf: 12345678912,
      user_gender_id: gender[0].gender_id,
    };

    const userInsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user,
        user_password: await hashProvider.generateHash(user.user_password),
      })
      .returning("*");

    const user2InsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user2,
        user_password: await hashProvider.generateHash(user2.user_password),
      })
      .returning("*");

    const user3InsertResponse = await dbConnection<UserEntity>("tb_users")
      .insert({
        ...user3,
        user_password: await hashProvider.generateHash(user3.user_password),
      })
      .returning("*");

    if (
      !userInsertResponse[0] ||
      !user2InsertResponse[0] ||
      !user3InsertResponse[0]
    ) {
      throw new Error("Users not created");
    }

    const user1Role = await dbConnection<RoleEntity>("tb_roles")
      .select("*")
      .where({
        role_id: userInsertResponse[0].user_role_id,
      })
      .first();

    const user2Role = await dbConnection<RoleEntity>("tb_roles")
      .select("*")
      .where({
        role_id: user2InsertResponse[0].user_role_id,
      })
      .first();

    const user3Role = await dbConnection<RoleEntity>("tb_roles")
      .select("*")
      .where({
        role_id: user3InsertResponse[0].user_role_id,
      })
      .first();

    if (!user1Role || !user2Role || !user3Role) {
      throw new Error("Roles not created");
    }

    const refreshTokenValid = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .insert({
        refresh_token_id: uuid(),
        refresh_token_user_id: userInsertResponse[0].user_id,
        refresh_token_expires_in: dateProvider.addDays(30),
      })
      .returning("*");

    const refreshTokenSecondValid = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .insert({
        refresh_token_id: uuid(),
        refresh_token_user_id: user2InsertResponse[0].user_id,
        refresh_token_expires_in: dateProvider.addDays(30),
      })
      .returning("*");

    const refreshTokenExpired = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .insert({
        refresh_token_id: uuid(),
        refresh_token_user_id: user3InsertResponse[0].user_id,
        refresh_token_expires_in: dateProvider.addDays(-30),
      })
      .returning("*");

    const oldTokenInCache = uuid();

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refreshTokenValid[0].refresh_token_id}`,
      value: JSON.stringify({
        user_id: userInsertResponse[0].user_id,
        user_name: user.user_name,
        user_role: user1Role.role_name,
      }),
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${refreshTokenSecondValid[0].refresh_token_id}`,
      value: JSON.stringify({
        user_id: user2InsertResponse[0].user_id,
        user_name: user2.user_name,
        user_role: user2Role.role_name,
      }),
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    await cacheProvider.cacheSet({
      key: `${auth.refresh.cachePrefix}:${oldTokenInCache}`,
      value: JSON.stringify({
        user_id: user3InsertResponse[0].user_id,
        user_name: user3.user_name,
        user_role: user3Role.role_name,
      }),
      expiresInSeconds: 60 * 60 * 24 * 30,
    });

    const response = await request(app)
      .post("/auth/synchronize_cache")
      .set("Authorization", `Bearer ${token}`);

    const tokenCacheValid = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refreshTokenValid[0].refresh_token_id}`,
    );

    const tokenCacheSecondValid = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refreshTokenSecondValid[0].refresh_token_id}`,
    );

    const tokenCacheExpired = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${refreshTokenExpired[0].refresh_token_id}`,
    );

    const oldTokenInCacheResponse = await cacheProvider.cacheGet(
      `${auth.refresh.cachePrefix}:${oldTokenInCache}`,
    );

    const refreshTokenDeleted = await dbConnection<RefreshTokenEntity>(
      "tb_refresh_tokens",
    )
      .select("*")
      .where({
        refresh_token_id: refreshTokenExpired[0].refresh_token_id,
      })
      .first();

    expect(response.status).toBe(204);
    expect(tokenCacheValid).toBe(
      JSON.stringify({
        user_id: userInsertResponse[0].user_id,
        user_name: user.user_name,
        user_role: user1Role.role_name,
      }),
    );
    expect(tokenCacheSecondValid).toBe(
      JSON.stringify({
        user_id: user2InsertResponse[0].user_id,
        user_name: user2.user_name,
        user_role: user2Role.role_name,
      }),
    );
    expect(tokenCacheExpired).toBeNull();
    expect(oldTokenInCacheResponse).toBeNull();
    expect(refreshTokenDeleted).toBeUndefined();
  });
});
