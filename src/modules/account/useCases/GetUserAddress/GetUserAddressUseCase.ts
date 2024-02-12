import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IFindUserAddressByIdDTO } from "@modules/account/@types/IFindUserAddressByIdDTO";
import { IAddressRepository } from "@modules/account/repositories/IAddressRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class GetUserAddressUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("AddressRepository")
    private addressRepository: IAddressRepository,
  ) {}

  async execute({ user_address_id }: IFindUserAddressByIdDTO) {
    const cacheKey = `${cachePrefixes.getUserAddress}:${user_address_id}`;

    const addressCached = await this.cacheProvider.cacheGet(cacheKey);

    if (addressCached) {
      return JSON.parse(addressCached);
    }

    const address = await this.addressRepository.findById(user_address_id);

    if (!address) {
      throw new AppError(AppErrorMessages.USER_ADDRESS_NOT_FOUND, 404);
    }

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(address),
      expiresInSeconds: 60 * 60 * 24,
    });

    return address;
  }
}

export { GetUserAddressUseCase };
