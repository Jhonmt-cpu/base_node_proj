import { ICreateStateDTO } from "@modules/users/@types/ICreateStateDTO";
import { IStateRepository } from "@modules/users/repositories/IStateRepository";
import { AppError } from "@shared/errors/AppError";
import { inject, injectable } from "tsyringe";

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
      throw new AppError("State already exists!");
    }

    const state = await this.stateRepository.create({
      state_name,
      state_uf,
    });

    return state;
  }
}

export { CreateStateUseCase };
