import { StateEntity } from "@modules/users/infra/knex/entities/StateEntity";

type ICreateStateRepositoryDTO = {
  state_name: string;
  state_uf: string;
};

type IStateRepository = {
  create(data: ICreateStateRepositoryDTO): Promise<StateEntity>;
  findById(id: number): Promise<StateEntity | undefined>;
  findAll(): Promise<StateEntity[]>;
  findByName(state_name: string): Promise<StateEntity | undefined>;
};

export { IStateRepository, ICreateStateRepositoryDTO };
