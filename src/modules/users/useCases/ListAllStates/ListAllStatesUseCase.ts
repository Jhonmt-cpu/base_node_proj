import { StateEntity } from "@modules/users/infra/knex/entities/StateEntity";
import { IStateRepository } from "@modules/users/repositories/IStateRepository";
import { inject, injectable } from "tsyringe";

@injectable()
class ListAllStatesUseCase {
  constructor(
    @inject("StateRepository")
    private statesRepository: IStateRepository,
  ) {}

  async execute(): Promise<StateEntity[]> {
    const states = await this.statesRepository.findAll();

    return states;
  }
}

export { ListAllStatesUseCase };
