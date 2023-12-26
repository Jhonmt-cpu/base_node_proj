import { UserEntity } from "@modules/users/infra/knex/entities/UserEntity";

import {
  ICreateUserRepositoryDTO,
  IFindUserByEmailOrCpfRepositoryDTO,
  IFlatUserCompleteResponseRepositoryDTO,
  IUserRepository,
} from "../IUserRepository";

import { DatabaseInMemory } from "./DatabaseInMemory";

class UserRepositoryInMemory implements IUserRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(data: ICreateUserRepositoryDTO): Promise<UserEntity> {
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
      user_gender_id: data.user_gender_id,
      user_role_id: userRoleId,
      user_created_at: new Date(),
      user_updated_at: new Date(),
    });

    this.databaseInMemory.users.push(user);

    return user;
  }

  async findByEmailOrCpf({
    user_email,
    user_cpf,
  }: IFindUserByEmailOrCpfRepositoryDTO): Promise<UserEntity | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_email === user_email || user.user_cpf === user_cpf,
    );

    return user;
  }

  async findById(user_id: number): Promise<UserEntity | undefined> {
    const user = this.databaseInMemory.users.find(
      (user) => user.user_id === user_id,
    );

    return user;
  }

  async findByIdWithAddressAndPhone(
    user_id: number,
  ): Promise<UserEntity | undefined> {
    const phone = this.databaseInMemory.phones.find(
      (phone) => phone.user_phone_id === user_id,
    );

    const address = this.databaseInMemory.addresses.find(
      (address) => address.user_address_id === user_id,
    );

    const user = this.databaseInMemory.users.find(
      (user) => user.user_id === user_id,
    );

    if (!user) {
      return undefined;
    }

    user.user_address = address;
    user.user_phone = phone;

    return user;
  }

  async findByIdComplete(
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
      return undefined;
    }

    const neighborhood = this.databaseInMemory.neighborhoods.find(
      (neighborhood) =>
        neighborhood.neighborhood_id === address.address_neighborhood_id,
    );

    if (!neighborhood) {
      return undefined;
    }

    const city = this.databaseInMemory.cities.find(
      (city) => city.city_id === neighborhood.neighborhood_city_id,
    );

    if (!city) {
      return undefined;
    }

    const state = this.databaseInMemory.states.find(
      (state) => state.state_id === city.city_state_id,
    );

    if (!state) {
      return undefined;
    }

    const phone = this.databaseInMemory.phones.find(
      (phone) => phone.user_phone_id === user_id,
    );

    if (!phone) {
      return undefined;
    }

    const gender = this.databaseInMemory.genders.find(
      (gender) => gender.gender_id === user.user_gender_id,
    );

    if (!gender) {
      return undefined;
    }

    const role = this.databaseInMemory.roles.find(
      (role) => role.role_id === user.user_role_id,
    );

    if (!role) {
      return undefined;
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
}

export { UserRepositoryInMemory };
