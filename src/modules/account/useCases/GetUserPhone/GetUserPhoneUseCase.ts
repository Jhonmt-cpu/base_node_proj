import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IFindUserPhoneByIdDTO } from "@modules/account/@types/IFindUserPhoneByIdDTO";
import { IPhoneRepository } from "@modules/account/repositories/IPhoneRepository";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class GetUserPhoneUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("PhoneRepository")
    private phoneRepository: IPhoneRepository,
  ) {}

  async execute({ user_id }: IFindUserPhoneByIdDTO) {
    const cacheKey = `${cachePrefixes.getUserPhone}:${user_id}`;

    const phoneCached = await this.cacheProvider.cacheGet(cacheKey);

    if (phoneCached) {
      return JSON.parse(phoneCached);
    }

    const phone = await this.phoneRepository.findById(user_id);

    if (!phone) {
      throw new AppError(AppErrorMessages.USER_PHONE_NOT_FOUND, 404);
    }

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(phone),
      expiresInSeconds: 60 * 60 * 24,
    });

    return phone;
  }
}

export { GetUserPhoneUseCase };
