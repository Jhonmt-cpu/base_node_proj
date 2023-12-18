import { StateEntity } from "@modules/users/infra/knex/entities/StateEntity";

import { ICreateStateDTO, IStateRepository } from "../IStateRepository";

class StateRepositoryInMemory implements IStateRepository {
  private states: StateEntity[] = [];

  async create(data: ICreateStateDTO): Promise<StateEntity> {
    const state = new StateEntity({
      state_id: this.states.length + 1,
      state_name: data.state_name,
      state_uf: data.state_uf,
      state_created_at: new Date(),
    });

    this.states.push(state);

    return state;
  }

  async findAll(): Promise<StateEntity[]> {
    return this.states;
  }
}

export { StateRepositoryInMemory };
