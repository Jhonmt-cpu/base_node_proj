import {
  IAddressRepository,
  ICreateAddressDTO,
} from "../../../repositories/IAddressRepository";
import { AddressEntity } from "../entities/AddressEntity";

class AddressRepository implements IAddressRepository {
  private static addresses: AddressEntity[] = [];

  async create(data: ICreateAddressDTO): Promise<AddressEntity> {
    const address = new AddressEntity({
      user_address_id: data.user_address_id,
      address_street: data.address_street,
      address_number: data.address_number,
      address_complement: data.address_complement,
      address_neighborhood_id: data.address_neighborhood_id,
      address_zip_code: data.address_zip_code,
      address_updated_at: new Date(),
    });

    AddressRepository.addresses.push(address);

    return address;
  }
}

export { AddressRepository };
