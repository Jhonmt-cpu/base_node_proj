import { hash } from "bcryptjs";
import { inject, injectable } from "tsyringe";

import { userToUserResponse } from "@modules/users/mappers/userToUserResponse";
import { IAddressRepository } from "@modules/users/repositories/IAddressRepository";
import { IGenderRepository } from "@modules/users/repositories/IGenderRepository";
import { INeighborhoodRepository } from "@modules/users/repositories/INeighborhoodRepository";
import { IPhoneRepository } from "@modules/users/repositories/IPhoneRepository";
import { IUserRepository } from "@modules/users/repositories/IUserRepository";
import { ICreateUserDTO } from "@modules/users/@types/ICreateUserDTO";

import { AppError } from "@shared/errors/AppError";

@injectable()
class CreateUserUseCase {
  constructor(
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
    phone,
    address,
  }: ICreateUserDTO) {
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

    const userPasswordHashed = await hash(user_password, 8);

    const user = await this.userRepository.create({
      user_name,
      user_cpf,
      user_email,
      user_password: userPasswordHashed,
      user_gender_id,
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

    const userResponse = userToUserResponse(user);

    return userResponse;
  }
}

export { CreateUserUseCase };
