import { StateEntity } from "@modules/users/infra/knex/entities/StateEntity";

import {
  ICreateStateRepositoryDTO,
  IStateRepository,
} from "../IStateRepository";

import { DatabaseInMemory } from "./DatabaseInMemory";

class StateRepositoryInMemory implements IStateRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(data: ICreateStateRepositoryDTO): Promise<StateEntity> {
    const state = new StateEntity({
      state_id: this.databaseInMemory.states.length + 1,
      state_name: data.state_name,
      state_uf: data.state_uf,
      state_created_at: new Date(),
    });

    this.databaseInMemory.states.push(state);

    return state;
  }

  async findAll(): Promise<StateEntity[]> {
    return this.databaseInMemory.states;
  }

  async findById(id: number): Promise<StateEntity | undefined> {
    return this.databaseInMemory.states.find((state) => state.state_id === id);
  }
}

export { StateRepositoryInMemory };
