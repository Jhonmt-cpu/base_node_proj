import { UserEntity } from "../infra/knex/entities/UserEntity";

type IUserWithoutPassword = Omit<UserEntity, "user_password">;

function userToUserWithoutPassword(user: UserEntity): IUserWithoutPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export { userToUserWithoutPassword };
