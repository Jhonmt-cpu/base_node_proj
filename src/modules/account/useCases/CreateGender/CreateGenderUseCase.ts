import { inject, injectable } from "tsyringe";

import { ICreateGenderDTO } from "@modules/account/@types/ICreateGenderDTO";
import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class CreateGenderUseCase {
  constructor(
    @inject("GenderRepository")
    private genderRepository: IGenderRepository,
  ) {}

  async execute({ gender_name }: ICreateGenderDTO) {
    const genderAlreadyExists = await this.genderRepository.findByName(
      gender_name,
    );

    if (genderAlreadyExists) {
      throw new AppError(AppErrorMessages.GENDER_ALREADY_EXISTS);
    }

    const gender = await this.genderRepository.create({
      gender_name,
    });

    return gender;
  }
}

export { CreateGenderUseCase };
