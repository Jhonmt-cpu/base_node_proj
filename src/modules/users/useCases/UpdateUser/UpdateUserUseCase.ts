import { inject, injectable } from "tsyringe";

import { IUpdateUserDTO } from "@modules/users/@types/IUpdateUserDTO";
import { IUpdateUserResponseDTO } from "@modules/users/@types/IUpdateUserResponseDTO";
import { IGenderRepository } from "@modules/users/repositories/IGenderRepository";
import { IPhoneRepository } from "@modules/users/repositories/IPhoneRepository";
import { IAddressRepository } from "@modules/users/repositories/IAddressRepository";
import { INeighborhoodRepository } from "@modules/users/repositories/INeighborhoodRepository";
import { IUserRepository } from "@modules/users/repositories/IUserRepository";
import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";

import { UserEntity } from "@modules/users/infra/knex/entities/UserEntity";
import { PhoneEntity } from "@modules/users/infra/knex/entities/PhoneEntity";
import { AddressEntity } from "@modules/users/infra/knex/entities/AddressEntity";

import { AppError } from "@shared/errors/AppError";

@injectable()
class UpdateUserUseCase {
  constructor(
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("GenderRepository")
    private genderRepository: IGenderRepository,
    @inject("PhoneRepository")
    private phoneRepository: IPhoneRepository,
    @inject("NeighborhoodRepository")
    private neighborhoodRepository: INeighborhoodRepository,
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({
    user_id,
    user_password,
    user_name,
    user_email,
    user_new_password: new_password,
    user_gender_id,
    user_phone,
    user_address,
  }: IUpdateUserDTO): Promise<IUpdateUserResponseDTO> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const passwordMatch = await this.hashProvider.compareHash(
      user_password,
      user.user_password,
    );

    if (!passwordMatch) {
      throw new AppError("Incorrect password", 401);
    }

    const updateUserFields: Partial<UserEntity> = {};

    if (user_name && user_name !== user.user_name) {
      updateUserFields.user_name = user_name;
    }

    if (user_email && user_email !== user.user_email) {
      const emailAlreadyExists = await this.userRepository.findByEmail(
        user_email,
      );

      if (emailAlreadyExists && emailAlreadyExists.user_id !== user_id) {
        throw new AppError("Email already in use");
      }

      updateUserFields.user_email = user_email;
    }

    if (new_password) {
      const passwordHash = await this.hashProvider.generateHash(new_password);

      updateUserFields.user_password = passwordHash;
    }

    if (user_gender_id && user_gender_id !== user.user_gender_id) {
      const genderExists = await this.genderRepository.findById(user_gender_id);

      if (!genderExists) {
        throw new AppError("Gender does not exists");
      }

      updateUserFields.user_gender_id = user_gender_id;
    }

    const updatePhoneFields: Partial<PhoneEntity> = {};

    if (user_phone) {
      const phoneAlreadyInUse = await this.phoneRepository.findByDDDAndNumber({
        phone_ddd: user_phone.phone_ddd,
        phone_number: user_phone.phone_number,
      });

      if (phoneAlreadyInUse && phoneAlreadyInUse.user_phone_id !== user_id) {
        throw new AppError("Phone already in use");
      }

      const currentUserPhone = await this.phoneRepository.findById(user_id);

      if (!currentUserPhone) {
        throw new AppError("Phone not found", 404);
      }

      if (currentUserPhone.phone_ddd !== user_phone.phone_ddd) {
        updatePhoneFields.phone_ddd = user_phone.phone_ddd;
      }

      if (currentUserPhone.phone_number !== user_phone.phone_number) {
        updatePhoneFields.phone_number = user_phone.phone_number;
      }
    }

    const updateAddressFields: Partial<AddressEntity> = {};

    if (user_address) {
      const keys = Object.keys(user_address);

      if (keys.length > 0) {
        const currentUserAddress = await this.addressRepository.findById(
          user_id,
        );

        if (!currentUserAddress) {
          throw new AppError("Address not found", 404);
        }

        if (
          user_address.address_street &&
          user_address.address_street !== currentUserAddress.address_street
        ) {
          updateAddressFields.address_street = user_address.address_street;
        }

        if (
          user_address.address_number &&
          user_address.address_number !== currentUserAddress.address_number
        ) {
          updateAddressFields.address_number = user_address.address_number;
        }

        if (
          user_address.address_complement &&
          user_address.address_complement !==
            currentUserAddress.address_complement
        ) {
          updateAddressFields.address_complement =
            user_address.address_complement;
        }

        if (
          user_address.address_neighborhood_id &&
          user_address.address_neighborhood_id !==
            currentUserAddress.address_neighborhood_id
        ) {
          const neighborhoodExists = await this.neighborhoodRepository.findById(
            user_address.address_neighborhood_id,
          );

          if (!neighborhoodExists) {
            throw new AppError("Neighborhood does not exists", 404);
          }

          updateAddressFields.address_neighborhood_id =
            user_address.address_neighborhood_id;
        }

        if (
          user_address.address_zip_code &&
          user_address.address_zip_code !== currentUserAddress.address_zip_code
        ) {
          updateAddressFields.address_zip_code = user_address.address_zip_code;
        }
      }
    }

    let userUpdateResponse: IUpdateUserResponseDTO = {
      user_id,
    };

    if (Object.keys(updateUserFields).length > 0) {
      const updatedUser = await this.userRepository.update({
        user_id,
        updateFields: updateUserFields,
      });

      userUpdateResponse = {
        ...userUpdateResponse,
        ...updatedUser,
      };
    }

    if (Object.keys(updatePhoneFields).length > 0) {
      const updatedPhone = await this.phoneRepository.update({
        user_phone_id: user_id,
        updateFields: updatePhoneFields,
      });

      userUpdateResponse = {
        ...userUpdateResponse,
        user_phone: updatedPhone,
      };
    }

    if (Object.keys(updateAddressFields).length > 0) {
      const updatedAddress = await this.addressRepository.update({
        user_address_id: user_id,
        updateFields: updateAddressFields,
      });

      userUpdateResponse = {
        ...userUpdateResponse,
        user_address: updatedAddress,
      };
    }

    return userUpdateResponse;
  }
}

export { UpdateUserUseCase };
