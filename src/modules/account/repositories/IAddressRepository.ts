import { AddressEntity } from "@modules/account/infra/knex/entities/AddressEntity";

type ICreateAddressRepositoryDTO = {
  user_address_id: number;
  address_street: string;
  address_number: number;
  address_complement?: string;
  address_neighborhood_id: number;
  address_zip_code: number;
};

type IUpdateAddressRepositoryDTO = {
  user_address_id: number;
  updateFields: Partial<AddressEntity>;
};

type IAddressRepository = {
  create(data: ICreateAddressRepositoryDTO): Promise<AddressEntity>;
  findById(user_address_id: number): Promise<AddressEntity | undefined>;
  update(data: IUpdateAddressRepositoryDTO): Promise<AddressEntity | undefined>;
};

export {
  IAddressRepository,
  ICreateAddressRepositoryDTO,
  IUpdateAddressRepositoryDTO,
};
