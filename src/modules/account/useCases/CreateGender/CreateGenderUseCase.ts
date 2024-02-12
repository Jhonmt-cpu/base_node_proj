import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { ICreateGenderDTO } from "@modules/account/@types/ICreateGenderDTO";
import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class CreateGenderUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
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

    await this.cacheProvider.cacheDel(cachePrefixes.listAllGenders);

    await this.cacheProvider.cacheDeleteAllByPrefix(
      cachePrefixes.listAllGendersPaginated,
    );

    return gender;
  }
}

export { CreateGenderUseCase };
