import { inject, injectable } from "tsyringe";

import { cachePrefixes } from "@config/cache";

import { IRoleRepository } from "@modules/account/repositories/IRoleRepository";
import { ICreateRoleDTO } from "@modules/account/@types/ICreateRoleDTO";

import { AppError } from "@errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";
import { ICacheProvider } from "@shared/container/providers/CacheProvider/ICacheProvider";

@injectable()
class CreateRoleUseCase {
  constructor(
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("RoleRepository")
    private roleRepository: IRoleRepository,
  ) {}

  async execute({ role_name }: ICreateRoleDTO) {
    const roleAlreadyExists = await this.roleRepository.findByName(role_name);

    if (roleAlreadyExists) {
      throw new AppError(AppErrorMessages.ROLE_ALREADY_EXISTS);
    }

    const role = await this.roleRepository.create({ role_name });

    await this.cacheProvider.cacheDeleteAllByPrefix(
      cachePrefixes.listAllRolesPaginated,
    );

    return role;
  }
}

export { CreateRoleUseCase };
