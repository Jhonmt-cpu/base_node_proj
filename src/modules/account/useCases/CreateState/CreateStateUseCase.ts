import { inject, injectable } from "tsyringe";

import { ICreateStateDTO } from "@modules/account/@types/ICreateStateDTO";
import { IStateRepository } from "@modules/account/repositories/IStateRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class CreateStateUseCase {
  constructor(
    @inject("StateRepository")
    private stateRepository: IStateRepository,
  ) {}

  async execute({ state_name, state_uf }: ICreateStateDTO) {
    const stateAlreadyExists = await this.stateRepository.findByName(
      state_name,
    );

    if (stateAlreadyExists) {
      throw new AppError(AppErrorMessages.STATE_ALREADY_EXISTS);
    }

    const state = await this.stateRepository.create({
      state_name,
      state_uf,
    });

    return state;
  }
}

export { CreateStateUseCase };
