import { inject, injectable } from "tsyringe";

import { IFindUserAddressByIdDTO } from "@modules/users/@types/IFindUserAddressByIdDTO";
import { IAddressRepository } from "@modules/users/repositories/IAddressRepository";

import { AppError } from "@shared/errors/AppError";

@injectable()
class GetUserAddressUseCase {
  constructor(
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute({ user_address_id }: IFindUserAddressByIdDTO) {
    const address = await this.addressRepository.findById(user_address_id);

    if (!address) {
      throw new AppError("Address not found!", 404);
    }

    return address;
  }
}

export { GetUserAddressUseCase };
