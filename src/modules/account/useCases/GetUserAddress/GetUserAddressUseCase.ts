import { inject, injectable } from "tsyringe";

import { IFindUserAddressByIdDTO } from "@modules/account/@types/IFindUserAddressByIdDTO";
import { IAddressRepository } from "@modules/account/repositories/IAddressRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class GetUserAddressUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute({ user_address_id }: IFindUserAddressByIdDTO) {
    const address = await this.addressRepository.findById(user_address_id);

    if (!address) {
      throw new AppError(AppErrorMessages.USER_ADDRESS_NOT_FOUND, 404);
    }

    return address;
  }
}

export { GetUserAddressUseCase };
