import { inject, injectable } from "tsyringe";

import { IRoleRepository } from "@modules/account/repositories/IRoleRepository";
import { ICreateRoleDTO } from "@modules/account/@types/ICreateRoleDTO";

import { AppError } from "@errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class CreateRoleUseCase {
  constructor(
    @inject("RoleRepository")
    private roleRepository: IRoleRepository,
  ) {}

  async execute({ role_name }: ICreateRoleDTO) {
    const roleAlreadyExists = await this.roleRepository.findByName(role_name);

    if (roleAlreadyExists) {
      throw new AppError(AppErrorMessages.ROLE_ALREADY_EXISTS);
    }

    const role = await this.roleRepository.create({ role_name });

    return role;
  }
}

export { CreateRoleUseCase };
