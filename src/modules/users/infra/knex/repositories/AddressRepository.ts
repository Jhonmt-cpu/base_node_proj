import { IAddressRepository, ICreateAddressDTO } from "../../../repositories/IAddressRepository";
import { AddressEntity } from "../entities/AddressEntity";

class AddressRepository implements IAddressRepository {
	private static addresses: AddressEntity[] = [];

	async create(data: ICreateAddressDTO): Promise<AddressEntity> {
		const address = new AddressEntity({
			user_address_id: data.user_address_id,
			address_street: data.address_street,
			address_number: data.address_number,
			address_complement: data.address_complement,
			address_neighborhood: data.address_neighborhood,
			address_city: data.address_city,
			address_state: data.address_state,
			address_zip_code: data.address_zip_code,
		});

		AddressRepository.addresses.push(address);

		return address;
	}
}

export { AddressRepository };