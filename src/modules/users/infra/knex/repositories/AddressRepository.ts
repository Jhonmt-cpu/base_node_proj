import {
  IAddressRepository,
  ICreateAddressDTO,
} from "@modules/users/repositories/IAddressRepository";

import { dbConnection } from "@shared/infra/database/knex";

import { AddressEntity } from "../entities/AddressEntity";

class AddressRepository implements IAddressRepository {
  async create(data: ICreateAddressDTO): Promise<AddressEntity> {
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
}

export { AddressRepository };
