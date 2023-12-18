import { StateEntity } from "@modules/users/infra/knex/entities/StateEntity";
import { ICreateStateDTO } from "@modules/users/@types/ICreateStateDTO";

type IStateRepository = {
  create(data: ICreateStateDTO): Promise<StateEntity>;
  findAll(): Promise<StateEntity[]>;
};

export { IStateRepository, ICreateStateDTO };
