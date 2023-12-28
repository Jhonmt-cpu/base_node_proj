import {
  IAddressRepository,
  ICreateAddressRepositoryDTO,
  IUpdateAddressRepositoryDTO,
} from "@modules/users/repositories/IAddressRepository";

import { dbConnection } from "@shared/infra/database/knex";

import { AddressEntity } from "../entities/AddressEntity";

class AddressRepository implements IAddressRepository {
  async create(data: ICreateAddressRepositoryDTO): Promise<AddressEntity> {
    const address = await dbConnection<AddressEntity>("tb_addresses")
      .insert({
        user_address_id: data.user_address_id,
        address_street: data.address_street,
        address_number: data.address_number,
        address_complement: data.address_complement,
        address_neighborhood_id: data.address_neighborhood_id,
        address_zip_code: data.address_zip_code,
      })
      .returning("*");

    return address[0];
  }

  async findById(user_address_id: number): Promise<AddressEntity | undefined> {
    const address = await dbConnection<AddressEntity>("tb_addresses")
      .select("*")
      .where({
        user_address_id,
      })
      .first();

    return address;
  }

  async update({
    user_address_id,
    updateFields,
  }: IUpdateAddressRepositoryDTO): Promise<AddressEntity | undefined> {
    const address = await dbConnection<AddressEntity>("tb_addresses")
      .update(updateFields)
      .where({
        user_address_id,
      })
      .returning("*");

    return address[0];
  }
}

export { AddressRepository };
