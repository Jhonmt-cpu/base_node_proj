import { StateEntity } from "../infra/knex/entities/StateEntity";

type ICreateStateDTO = {
  state_name: string;
  state_uf: string;
};

type IStateRepository = {
  create(data: ICreateStateDTO): Promise<StateEntity>;
};

export { IStateRepository, ICreateStateDTO };
