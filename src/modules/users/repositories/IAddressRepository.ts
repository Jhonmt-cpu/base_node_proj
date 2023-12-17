import { AddressEntity } from "../infra/knex/entities/AddressEntity";

type ICreateAddressDTO = {
  user_address_id: number;
  address_street: string;
  address_number: number;
  address_complement?: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip_code: number;
}

type IAddressRepository = {
  create(data: ICreateAddressDTO): Promise<AddressEntity>;
}

export { IAddressRepository, ICreateAddressDTO };