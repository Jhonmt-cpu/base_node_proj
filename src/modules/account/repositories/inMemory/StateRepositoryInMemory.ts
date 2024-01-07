import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";

import {
  ICreateStateRepositoryDTO,
  IStateRepository,
} from "../IStateRepository";

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

  async findByName(state_name: string): Promise<StateEntity | undefined> {
    const state = this.databaseInMemory.states.find(
      (state) => state.state_name === state_name,
    );

    return state;
  }
}

export { StateRepositoryInMemory };
