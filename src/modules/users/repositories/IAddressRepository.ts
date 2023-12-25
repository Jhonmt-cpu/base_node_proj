import { AddressEntity } from "@modules/users/infra/knex/entities/AddressEntity";

type ICreateAddressRepositoryDTO = {
  user_address_id: number;
  address_street: string;
  address_number: number;
  address_complement?: string;
  address_neighborhood_id: number;
  address_zip_code: number;
};

type IAddressRepository = {
  create(data: ICreateAddressRepositoryDTO): Promise<AddressEntity>;
};

export { IAddressRepository, ICreateAddressRepositoryDTO as ICreateAddressDTO };
