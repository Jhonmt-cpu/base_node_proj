import { DatabaseInMemory } from "@global/repositories/inMemory/DatabaseInMemory";

import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";

import {
  ICreateUserRepositoryDTO,
  IFindAllUsersPaginatedRepositoryDTO,
  IFindUserByEmailOrCpfRepositoryDTO,
  IFlatUserCompleteResponseRepositoryDTO,
  IUserCreateResponseRepositoryDTO,
  IUserWithoutPasswordRepositoryDTO,
  IUserRepository,
  IUpdateUserRepositoryDTO,
  IFlatUserWithRoleResponseRepositoryDTO,
} from "../IUserRepository";

class UserRepositoryInMemory implements IUserRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(
    data: ICreateUserRepositoryDTO,
  ): Promise<IUserCreateResponseRepositoryDTO> {
    const userRole = this.databaseInMemory.roles.find(
      (role) => role.role_name === "role_test",
    );

    const userRoleId = userRole?.role_id || 1;

    const user = new UserEntity({
      user_id: this.databaseInMemory.users.length + 1,
      user_name: data.user_name,
      user_email: data.user_email,
      user_password: data.user_password,
      user_cpf: data.user_cpf,
      user_birth_date: data.user_birth_date,
      user_gender_id: data.user_gender_id,
      user_role_id: userRoleId,
      user_created_at: new Date(),
      user_updated_at: new Date(),
    });

    this.databaseInMemory.users.push(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_role_id, user_cpf, user_password, ...userCreateResponse } =
      user;

    return userCreateResponse;
  }

  async findByEmailOrCpf({
    user_email,
    user_cpf,
  }: IFindUserByEmailOrCpfRepositoryDTO): Promise<
    IUserWithoutPasswordRepositoryDTO | undefined
  > {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_email === user_email || user.user_cpf === user_cpf,
    );

    if (!user) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async findById(user_id: number): Promise<UserEntity | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_id === user_id,
    );

    return user;
  }

  async findByEmail(user_email: string): Promise<UserEntity | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_email === user_email,
    );

    return user;
  }

  async findByEmailWithRole(
    user_email: string,
  ): Promise<IFlatUserWithRoleResponseRepositoryDTO | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_email === user_email,
    );

    if (!user) {
      return undefined;
    }

    const role = this.databaseInMemory.roles.find(
      (role) => role.role_id === user.user_role_id,
    );

    if (!role) {
      throw new Error("Role not found");
    }

    const userWithRole = {
      ...user,
      ...role,
    };

    return userWithRole;
  }

  async findByIdWithoutPassword(
    user_id: number,
  ): Promise<IUserWithoutPasswordRepositoryDTO | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_id === user_id,
    );

    if (!user) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async findByIdCompleteRelations(
    user_id: number,
  ): Promise<IFlatUserCompleteResponseRepositoryDTO | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_id === user_id,
    );

    if (!user) {
      return undefined;
    }

    const address = this.databaseInMemory.addresses.find(
      (address) => address.user_address_id === user_id,
    );

    if (!address) {
      throw new Error("Address not found");
    }

    const neighborhood = this.databaseInMemory.neighborhoods.find(
      (neighborhood) =>
        neighborhood.neighborhood_id === address.address_neighborhood_id,
    );

    if (!neighborhood) {
      throw new Error("Neighborhood not found");
    }

    const city = this.databaseInMemory.cities.find(
      (city) => city.city_id === neighborhood.neighborhood_city_id,
    );

    if (!city) {
      throw new Error("City not found");
    }

    const state = this.databaseInMemory.states.find(
      (state) => state.state_id === city.city_state_id,
    );

    if (!state) {
      throw new Error("State not found");
    }

    const phone = this.databaseInMemory.phones.find(
      (phone) => phone.user_phone_id === user_id,
    );

    if (!phone) {
      throw new Error("Phone not found");
    }

    const gender = this.databaseInMemory.genders.find(
      (gender) => gender.gender_id === user.user_gender_id,
    );

    if (!gender) {
      throw new Error("Gender not found");
    }

    const role = this.databaseInMemory.roles.find(
      (role) => role.role_id === user.user_role_id,
    );

    if (!role) {
      throw new Error("Role not found");
    }

    const userResponse = {
      ...user,
      ...address,
      ...phone,
      ...gender,
      ...role,
      ...neighborhood,
      ...city,
      ...state,
    };

    return userResponse;
  }

  async findAllPaginated({
    limit,
    page,
  }: IFindAllUsersPaginatedRepositoryDTO): Promise<
    IUserWithoutPasswordRepositoryDTO[]
  > {
    const users = this.databaseInMemory.users.slice(
      (page - 1) * limit,
      page * limit,
    );

    const usersWithoutPassword = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    });

    return usersWithoutPassword;
  }

  async deleteById(user_id: number): Promise<void> {
    const userIndex = this.databaseInMemory.users.findIndex(
      (user) => user.user_id === user_id,
    );

    this.databaseInMemory.users.splice(userIndex, 1);
  }

  async update({
    user_id,
    updateFields,
  }: IUpdateUserRepositoryDTO): Promise<
    IUserCreateResponseRepositoryDTO | undefined
  > {
    const userIndex = this.databaseInMemory.users.findIndex(
      (user) => user.user_id === user_id,
    );

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const user = this.databaseInMemory.users[userIndex];

    const userUpdated = {
      ...user,
      ...updateFields,
      user_updated_at: new Date(),
    };

    this.databaseInMemory.users[userIndex] = userUpdated;

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_role_id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_cpf,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_gender,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user_role,
      ...userCreateResponse
    } = userUpdated;

    return userCreateResponse;
  }
}

export { UserRepositoryInMemory };
