import { inject, injectable } from "tsyringe";
import { IRoleRepository } from "../../repositories/IRoleRepository";
import { AppError } from "../../../../shared/errors/AppError";

@injectable()
class CreateRoleUseCase {
	constructor(
    @inject("RoleRepository")
    private roleRepository: IRoleRepository
	) {}

	async execute(role_name: string) {
    const roleAlreadyExists = await this.roleRepository.findByName(role_name);

    if (roleAlreadyExists) {
      throw new AppError("Role already exists!");
    }

		const role = await this.roleRepository.create({ role_name });

		return role;
	}
}

export { CreateRoleUseCase };