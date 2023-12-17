import { ICreateUserDTO, IUserRepository } from "../../../repositories/IUserRespository";
import { UserEntity } from "../entities/UserEntity";

class UserRepository implements IUserRepository {
	private static users: UserEntity[] = [];

	async create(data: ICreateUserDTO): Promise<UserEntity> {
		const user = new UserEntity({
			user_id: UserRepository.users.length + 1,
			user_name: data.user_name,
			user_email: data.user_email,
			user_password: data.user_password,
			user_cpf: data.user_cpf,
			user_gender_id: data.user_gender_id,
			user_role_id: 2,
		});

		UserRepository.users.push(user);

		return user;
	}
}

export { UserRepository };