import request from "supertest";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";

import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";

describe("List All States Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to list all states", async () => {
    await dbConnection<StateEntity>("tb_states").insert({
      state_name: "New State",
      state_uf: "NS",
    });

    const allStates = await dbConnection<StateEntity>("tb_states").select("*");

    const allStatesWithDateStrings = allStates.map((state) => ({
      ...state,
      state_created_at: state.state_created_at.toISOString(),
    }));

    const response = await request(app).get("/account/state/all");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allStatesWithDateStrings);
  });

  it("should return 204 if states are empty", async () => {
    await dbConnection<UserEntity>("tb_users").del();

    await dbConnection<AddressEntity>("tb_addresses").del();

    await dbConnection<NeighborhoodEntity>("tb_neighborhoods").del();

    await dbConnection<CityEntity>("tb_cities").del();

    await dbConnection<StateEntity>("tb_states").del();

    const response = await request(app).get("/account/state/all");

    expect(response.status).toBe(204);
  });
});
