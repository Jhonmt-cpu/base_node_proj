import { inject, injectable } from "tsyringe";

import { IAddressRepository } from "@modules/account/repositories/IAddressRepository";
import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";
import { IPhoneRepository } from "@modules/account/repositories/IPhoneRepository";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { ICreateUserDTO } from "@modules/account/@types/ICreateUserDTO";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";

import { AppError } from "@shared/errors/AppError";

@injectable()
class CreateUserUseCase {
  constructor(
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
    user_phone: phone,
    user_address: address,
  }: ICreateUserDTO) {
    const differenceInYear = this.dateProvider.getDifferenceInYears({
      start_date: user_birth_date,
      end_date: this.dateProvider.dateNow(),
    });

    if (differenceInYear < 18 || differenceInYear > 120) {
      throw new AppError("User age must be between 18 and 120");
    }

    const genderExists = await this.genderRepository.findById(user_gender_id);

    if (!genderExists) {
      throw new AppError("Invalid Gender", 404);
    }

    const {
      address_neighborhood_id,
      address_number,
      address_street,
      address_zip_code,
      address_complement,
    } = address;

    const neighborhoodExists = await this.neighborhoodRepository.findById(
      address_neighborhood_id,
    );

    if (!neighborhoodExists) {
      throw new AppError("Invalid Neighborhood", 404);
    }

    const { phone_ddd, phone_number } = phone;

    const phoneAlreadyExists = await this.phoneRepository.findByDDDAndNumber({
      phone_ddd,
      phone_number,
    });

    if (phoneAlreadyExists) {
      throw new AppError("Phone already exists", 400);
    }

    const userAlreadyExists = await this.userRepository.findByEmailOrCpf({
      user_email,
      user_cpf,
    });

    if (userAlreadyExists) {
      throw new AppError("User already exists", 400);
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

    return user;
  }
}

export { CreateUserUseCase };
