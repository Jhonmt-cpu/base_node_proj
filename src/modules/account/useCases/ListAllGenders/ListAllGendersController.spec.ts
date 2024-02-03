import request from "supertest";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

describe("List All Genders Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to list all genders", async () => {
    await dbConnection<GenderEntity>("tb_genders").insert({
      gender_name: "New Gender",
    });

    const allGenders = await dbConnection<GenderEntity>("tb_genders").select(
      "*",
    );

    const allGendersWithDateStrings = allGenders.map((gender) => ({
      ...gender,
      gender_created_at: gender.gender_created_at.toISOString(),
    }));

    const response = await request(app).get("/account/gender/all");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allGendersWithDateStrings);
  });

  it("should return 204 if genders are empty", async () => {
    await dbConnection<UserEntity>("tb_users").del();

    await dbConnection<GenderEntity>("tb_genders").del();

    const response = await request(app).get("/account/gender/all");

    expect(response.status).toBe(204);
  });
});
