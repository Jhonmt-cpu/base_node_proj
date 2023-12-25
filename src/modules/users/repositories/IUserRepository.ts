import { UserEntity } from "@modules/users/infra/knex/entities/UserEntity";

type ICreateUserRepositoryDTO = {
  user_name: string;
  user_email: string;
  user_password: string;
  user_cpf: number;
  user_gender_id: number;
};

type IFindUserByEmailOrCpfDTO = {
  user_email: string;
  user_cpf: number;
};

type IUserRepository = {
  create(data: ICreateUserRepositoryDTO): Promise<UserEntity>;
  findByEmailOrCpf(
    data: IFindUserByEmailOrCpfDTO,
  ): Promise<UserEntity | undefined>;
};

export { IUserRepository, ICreateUserRepositoryDTO, IFindUserByEmailOrCpfDTO };
