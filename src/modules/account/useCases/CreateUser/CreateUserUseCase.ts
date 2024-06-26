import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IAddressRepository } from "@modules/account/repositories/IAddressRepository";
import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";
import { IPhoneRepository } from "@modules/account/repositories/IPhoneRepository";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { ICreateUserDTO } from "@modules/account/@types/ICreateUserDTO";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class CreateUserUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("GenderRepository")
    private genderRepository: IGenderRepository,
    @inject("NeighborhoodRepository")
    private neighborhoodRepository: INeighborhoodRepository,
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
    @inject("PhoneRepository")
    private phoneRepository: IPhoneRepository,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({
    user_name,
    user_email,
    user_cpf,
    user_gender_id,
    user_password,
    user_birth_date,
    user_phone,
    user_address,
  }: ICreateUserDTO) {
    const differenceInYear = this.dateProvider.getDifferenceInYears({
      start_date: user_birth_date,
      end_date: this.dateProvider.dateNow(),
    });

    if (differenceInYear < 18 || differenceInYear > 120) {
      throw new AppError(AppErrorMessages.USER_INVALID_AGE);
    }

    const genderExists = await this.genderRepository.findById(user_gender_id);

    if (!genderExists) {
      throw new AppError(AppErrorMessages.GENDER_NOT_FOUND, 404);
    }

    const {
      address_neighborhood_id,
      address_number,
      address_street,
      address_zip_code,
      address_complement,
    } = user_address;

    const neighborhoodExists = await this.neighborhoodRepository.findById(
      address_neighborhood_id,
    );

    if (!neighborhoodExists) {
      throw new AppError(AppErrorMessages.NEIGHBORHOOD_NOT_FOUND, 404);
    }

    const { phone_ddd, phone_number } = user_phone;

    const phoneAlreadyExists = await this.phoneRepository.findByDDDAndNumber({
      phone_ddd,
      phone_number,
    });

    if (phoneAlreadyExists) {
      throw new AppError(AppErrorMessages.USER_PHONE_ALREADY_EXISTS, 400);
    }

    const userAlreadyExists = await this.userRepository.findByEmailOrCpf({
      user_email,
      user_cpf,
    });

    if (userAlreadyExists) {
      throw new AppError(AppErrorMessages.USER_ALREADY_EXISTS, 400);
    }

    const userPasswordHashed = await this.hashProvider.generateHash(
      user_password,
    );

    const user = await this.userRepository.create({
      user_name,
      user_cpf,
      user_email,
      user_password: userPasswordHashed,
      user_gender_id,
      user_birth_date,
    });

    await this.phoneRepository.create({
      phone_ddd,
      phone_number,
      user_phone_id: user.user_id,
    });

    await this.addressRepository.create({
      address_street,
      address_number,
      address_complement,
      address_neighborhood_id,
      address_zip_code,
      user_address_id: user.user_id,
    });

    await this.cacheProvider.cacheDeleteAllByPrefix(
      cachePrefixes.listAllUsersPaginated,
    );

    return user;
  }
}

export { CreateUserUseCase };
