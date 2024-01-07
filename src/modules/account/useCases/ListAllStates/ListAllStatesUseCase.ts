import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { IStateRepository } from "@modules/account/repositories/IStateRepository";
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
