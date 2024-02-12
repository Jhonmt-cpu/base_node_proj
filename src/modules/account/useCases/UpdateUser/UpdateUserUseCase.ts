import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IUpdateUserDTO } from "@modules/account/@types/IUpdateUserDTO";
import { IUpdateUserResponseDTO } from "@modules/account/@types/IUpdateUserResponseDTO";
import { IGenderRepository } from "@modules/account/repositories/IGenderRepository";
import { IPhoneRepository } from "@modules/account/repositories/IPhoneRepository";
import { IAddressRepository } from "@modules/account/repositories/IAddressRepository";
import { INeighborhoodRepository } from "@modules/account/repositories/INeighborhoodRepository";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";

import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";

import { IHashProvider } from "@shared/container/providers/HashProvider/IHashProvider";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class UpdateUserUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
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
    user_new_password,
    user_gender_id,
    user_phone,
    user_address,
    is_admin_request,
  }: IUpdateUserDTO): Promise<IUpdateUserResponseDTO> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    if (!is_admin_request) {
      const passwordMatch = await this.hashProvider.compareHash(
        user_password,
        user.user_password,
      );

      if (!passwordMatch) {
        throw new AppError(AppErrorMessages.USER_INCORRECT_PASSWORD, 401);
      }
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
        throw new AppError(AppErrorMessages.USER_EMAIL_ALREADY_IN_USE);
      }

      updateUserFields.user_email = user_email;
    }

    if (user_new_password) {
      const passwordHash = await this.hashProvider.generateHash(
        user_new_password,
      );

      updateUserFields.user_password = passwordHash;
    }

    if (user_gender_id && user_gender_id !== user.user_gender_id) {
      const genderExists = await this.genderRepository.findById(user_gender_id);

      if (!genderExists) {
        throw new AppError(AppErrorMessages.GENDER_NOT_FOUND, 404);
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
        throw new AppError(AppErrorMessages.USER_PHONE_ALREADY_IN_USE);
      }

      const currentUserPhone = await this.phoneRepository.findById(user_id);

      if (!currentUserPhone) {
        throw new AppError(AppErrorMessages.USER_PHONE_NOT_FOUND, 404);
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
          throw new AppError(AppErrorMessages.USER_ADDRESS_NOT_FOUND, 404);
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
            throw new AppError(AppErrorMessages.NEIGHBORHOOD_NOT_FOUND, 404);
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

      await this.cacheProvider.cacheDeleteAllByPrefix(
        cachePrefixes.listAllUsersPaginated,
      );

      await this.cacheProvider.cacheDel(`${cachePrefixes.getUser}:${user_id}`);

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

      await this.cacheProvider.cacheDel(
        `${cachePrefixes.getUserPhone}:${user_id}`,
      );

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

      await this.cacheProvider.cacheDel(
        `${cachePrefixes.getUserAddress}:${user_id}`,
      );

      userUpdateResponse = {
        ...userUpdateResponse,
        user_address: updatedAddress,
      };
    }

    if (Object.keys(userUpdateResponse).length > 1) {
      await this.cacheProvider.cacheDel(
        `${cachePrefixes.getUserComplete}:${user_id}`,
      );
    }

    return userUpdateResponse;
  }
}

export { UpdateUserUseCase };
