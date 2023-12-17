import { AddressEntity } from "../infra/knex/entities/AddressEntity";

type ICreateAddressDTO = {
  user_address_id: number;
  address_street: string;
  address_number: number;
  address_complement?: string;
  address_neighborhood_id: number;
  address_zip_code: number;
};

type IAddressRepository = {
  create(data: ICreateAddressDTO): Promise<AddressEntity>;
};

export { IAddressRepository, ICreateAddressDTO };
