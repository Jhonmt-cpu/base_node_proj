import request from "supertest";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";

import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";

import { dbConnection } from "@shared/infra/database/knex";
import { app } from "@shared/infra/http/app";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

describe("List Neighborhoods By City Controller", () => {
  beforeAll(async () => {
    await dbConnection.migrate.latest();
    await dbConnection.seed.run();
  });

  afterAll(async () => {
    await dbConnection.migrate.rollback();
    await dbConnection.destroy();
  });

  it("should be able to list all neighborhoods by city", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State",
        state_uf: "NS",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City",
        city_state_id: state[0].state_id,
      })
      .returning("*");

    if (!city[0]) {
      throw new Error("City not created");
    }

    const neighborhoodsToInsert = [];

    for (let i = 0; i < 10; i++) {
      neighborhoodsToInsert.push({
        neighborhood_name: `Neighborhood ${i}`,
        neighborhood_city_id: city[0].city_id,
      });
    }

    await dbConnection<NeighborhoodEntity>("tb_neighborhoods").insert(
      neighborhoodsToInsert,
    );

    const allNeighborhoods = await dbConnection<NeighborhoodEntity>(
      "tb_neighborhoods",
    )
      .where({
        neighborhood_city_id: city[0].city_id,
      })
      .select("*");

    const allNeighborhoodsWithDateStrings = allNeighborhoods.map(
      (neighborhood) => ({
        ...neighborhood,
        neighborhood_created_at:
          neighborhood.neighborhood_created_at.toISOString(),
      }),
    );

    const response = await request(app).get(
      `/account/city/${city[0].city_id}/neighborhood`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(allNeighborhoodsWithDateStrings);
  });

  it("should return 204 if neighborhoods are empty", async () => {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: "New State 2",
        state_uf: "N2",
      })
      .returning("*");

    if (!state[0]) {
      throw new Error("State not created");
    }

    const city = await dbConnection<CityEntity>("tb_cities")
      .insert({
        city_name: "New City 2",
        city_state_id: state[0].state_id,
      })
      .returning("*");

    if (!city[0]) {
      throw new Error("City not created");
    }

    const response = await request(app).get(
      `/account/city/${city[0].city_id}/neighborhood`,
    );

    expect(response.status).toBe(204);
  });

  it("should not be able to list the neighborhoods of a non-existing city", async () => {
    const response = await request(app).get("/account/city/999/neighborhood");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(AppErrorMessages.CITY_NOT_FOUND);
  });
});
