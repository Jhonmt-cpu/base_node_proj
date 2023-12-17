import {
  ICreateStateDTO,
  IStateRepository,
} from "../../../repositories/IStateRepository";
import { StateEntity } from "../entities/StateEntity";

class StateRepository implements IStateRepository {
  private static states: StateEntity[] = [];

  async create(data: ICreateStateDTO): Promise<StateEntity> {
    const state = new StateEntity({
      state_id: StateRepository.states.length + 1,
      state_name: data.state_name,
      state_uf: data.state_uf,
      state_created_at: new Date(),
    });

    StateRepository.states.push(state);

    return state;
  }
}

export { StateRepository };
