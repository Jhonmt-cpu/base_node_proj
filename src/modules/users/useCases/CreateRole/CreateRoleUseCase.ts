import { inject, injectable } from "tsyringe";

import { IRoleRepository } from "@modules/users/repositories/IRoleRepository";
import { ICreateRoleDTO } from "@modules/users/@types/ICreateRoleDTO";

import { AppError } from "@errors/AppError";

@injectable()
class CreateRoleUseCase {
  constructor(
    @inject("RoleRepository")
    private roleRepository: IRoleRepository,
  ) {}

  async execute({ role_name }: ICreateRoleDTO) {
    const roleAlreadyExists = await this.roleRepository.findByName(role_name);

    if (roleAlreadyExists) {
      throw new AppError("Role already exists!");
    }

    const role = await this.roleRepository.create({ role_name });

    return role;
  }
}

export { CreateRoleUseCase };
