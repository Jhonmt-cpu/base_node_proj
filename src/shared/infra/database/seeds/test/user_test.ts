import { Knex } from "knex";

import test from "@config/test";

import { CityEntity } from "@modules/account/infra/knex/entities/CityEntity";
import { StateEntity } from "@modules/account/infra/knex/entities/StateEntity";
import { NeighborhoodEntity } from "@modules/account/infra/knex/entities/NeighborhoodEntity";
import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";
import { RoleEntity } from "@modules/account/infra/knex/entities/RoleEntity";
import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";
import { BcryptjsHashProvider } from "@shared/container/providers/HashProvider/implementations/BcryptjsHashProvider";
import { UserEntity } from "@modules/account/infra/knex/entities/UserEntity";
import { PhoneEntity } from "@modules/account/infra/knex/entities/PhoneEntity";

export async function seed(knex: Knex): Promise<void> {
  await knex("tb_users").del();
  await knex("tb_neighborhoods").del();
  await knex("tb_cities").del();
  await knex("tb_states").del();

  const {
    state_test,
    city_test,
    neighborhood_test,
    user_test_admin,
    address_test_admin,
    phone_test_admin,
    user_test,
    address_test,
    phone_test,
  } = test;

  const state = await knex<StateEntity>("tb_states")
    .insert(state_test)
    .returning("*");

  if (!state[0]) {
    throw new Error("State not found");
  }

  const city = await knex<CityEntity>("tb_cities")
    .insert({
      city_name: city_test.city_name,
      city_state_id: state[0].state_id,
    })
    .returning("*");

  if (!city[0]) {
    throw new Error("City not found");
  }

  const neighborhood = await knex<NeighborhoodEntity>("tb_neighborhoods")
    .insert({
      neighborhood_name: neighborhood_test.neighborhood_name,
      neighborhood_city_id: city[0].city_id,
    })
    .returning("*");

  if (!neighborhood[0]) {
    throw new Error("Neighborhood not found");
  }

  const roleAdmin = await knex<RoleEntity>("tb_roles")
    .select("*")
    .where({
      role_name: "Admin",
    })
    .first();

  if (!roleAdmin) {
    throw new Error("Role not found");
  }

  const gender = await knex<GenderEntity>("tb_genders")
    .select("*")
    .where({
      gender_name: "Masculino",
    })
    .first();

  if (!gender) {
    throw new Error("Gender not found");
  }

  const hashProvider = new BcryptjsHashProvider();

  const passwordHashAdmin = await hashProvider.generateHash(
    user_test_admin.user_password,
  );

  const userAdmin = await knex<UserEntity>("tb_users")
    .insert({
      user_name: user_test_admin.user_name,
      user_email: user_test_admin.user_email,
      user_cpf: user_test_admin.user_cpf,
      user_birth_date: user_test_admin.user_birth_date,
      user_password: passwordHashAdmin,
      user_gender_id: gender.gender_id,
      user_role_id: roleAdmin.role_id,
    })
    .returning("*");

  if (!userAdmin[0]) {
    throw new Error("User not found");
  }

  const addressAdmin = await knex<AddressEntity>("tb_addresses")
    .insert({
      user_address_id: userAdmin[0].user_id,
      address_street: address_test_admin.address_street,
      address_number: address_test_admin.address_number,
      address_zip_code: address_test_admin.address_zip_code,
      address_neighborhood_id: neighborhood[0].neighborhood_id,
      address_complement: address_test_admin.address_complement,
    })
    .returning("*");

  if (!addressAdmin[0]) {
    throw new Error("Address not found");
  }

  const phoneAdmin = await knex<PhoneEntity>("tb_phones")
    .insert({
      user_phone_id: userAdmin[0].user_id,
      phone_ddd: phone_test_admin.phone_ddd,
      phone_number: phone_test_admin.phone_number,
    })
    .returning("*");

  if (!phoneAdmin) {
    throw new Error("Phone not found");
  }

  const roleUser = await knex<RoleEntity>("tb_roles")
    .select("*")
    .where({
      role_name: "User",
    })
    .first();

  if (!roleUser) {
    throw new Error("Role not found");
  }

  const passwordHash = await hashProvider.generateHash(user_test.user_password);

  const user = await knex<UserEntity>("tb_users")
    .insert({
      user_name: user_test.user_name,
      user_email: user_test.user_email,
      user_cpf: user_test.user_cpf,
      user_birth_date: user_test.user_birth_date,
      user_password: passwordHash,
      user_gender_id: gender.gender_id,
      user_role_id: roleUser.role_id,
    })
    .returning("*");

  if (!user[0]) {
    throw new Error("User not found");
  }

  const address = await knex<AddressEntity>("tb_addresses")
    .insert({
      user_address_id: user[0].user_id,
      address_street: address_test.address_street,
      address_number: address_test.address_number,
      address_zip_code: address_test.address_zip_code,
      address_neighborhood_id: neighborhood[0].neighborhood_id,
      address_complement: address_test.address_complement,
    })
    .returning("*");

  if (!address[0]) {
    throw new Error("Address not found");
  }

  const phone = await knex<PhoneEntity>("tb_phones")
    .insert({
      user_phone_id: user[0].user_id,
      phone_ddd: phone_test.phone_ddd,
      phone_number: phone_test.phone_number,
    })
    .returning("*");

  if (!phone) {
    throw new Error("Phone not found");
  }
}
