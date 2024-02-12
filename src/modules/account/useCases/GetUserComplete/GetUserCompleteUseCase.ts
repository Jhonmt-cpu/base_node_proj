import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IFindUserCompleteByIdDTO } from "@modules/account/@types/IFindUserCompleteByIdDTO";
import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { flatUserCompleteToUserWithoutPassword } from "@modules/account/mappers/flatUserCompleteToUserWithoutPassword";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class GetUserCompleteUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IFindUserCompleteByIdDTO) {
    const cacheKey = `${cachePrefixes.getUserComplete}:${user_id}`;

    const userCached = await this.cacheProvider.cacheGet(cacheKey);

    if (userCached) {
      return JSON.parse(userCached);
    }

    const user = await this.userRepository.findByIdCompleteRelations(user_id);

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    const userWithoutPassword = flatUserCompleteToUserWithoutPassword(user);

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(userWithoutPassword),
      expiresInSeconds: 60 * 60 * 24,
    });

    return userWithoutPassword;
  }
}

export { GetUserCompleteUseCase };
