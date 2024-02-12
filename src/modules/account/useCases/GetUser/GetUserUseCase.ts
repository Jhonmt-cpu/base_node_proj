import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { IFindUserByIdDTO } from "@modules/account/@types/IFindUserByIdDTO";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class GetUserUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  async execute({ user_id }: IFindUserByIdDTO) {
    const cacheKey = `${cachePrefixes.getUser}:${user_id}`;

    const userCached = await this.cacheProvider.cacheGet(cacheKey);

    if (userCached) {
      return JSON.parse(userCached);
    }

    const user = await this.userRepository.findByIdWithoutPassword(user_id);

    if (!user) {
      throw new AppError(AppErrorMessages.USER_NOT_FOUND, 404);
    }

    await this.cacheProvider.cacheSet({
      key: cacheKey,
      value: JSON.stringify(user),
      expiresInSeconds: 60 * 60 * 24,
    });

    return user;
  }
}

export { GetUserUseCase };
