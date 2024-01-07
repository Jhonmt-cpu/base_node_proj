import {
  IStateRepository,
  ICreateStateRepositoryDTO,
} from "@modules/account/repositories/IStateRepository";

import { StateEntity } from "../entities/StateEntity";
import { dbConnection } from "@shared/infra/database/knex";

class StateRepository implements IStateRepository {
  async create(data: ICreateStateRepositoryDTO): Promise<StateEntity> {
    const state = await dbConnection<StateEntity>("tb_states")
      .insert({
        state_name: data.state_name,
        state_uf: data.state_uf,
      })
      .returning("*");

    return state[0];
  }

  async findAll(): Promise<StateEntity[]> {
    const states = await dbConnection<StateEntity>("tb_states").select("*");

    return states;
  }

  async findById(id: number): Promise<StateEntity | undefined> {
    const state = await dbConnection<StateEntity>("tb_states")
      .select("*")
      .where({
        state_id: id,
      })
      .first();

    return state;
  }

  async findByName(state_name: string): Promise<StateEntity | undefined> {
    const state = await dbConnection<StateEntity>("tb_states")
      .select("*")
      .where({
        state_name: state_name,
      })
      .first();

    return state;
  }
}

export { StateRepository };
