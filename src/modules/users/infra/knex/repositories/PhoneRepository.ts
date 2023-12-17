import { ICreatePhoneRepositoryDTO, IPhoneRepository } from "../../../repositories/IPhoneRepository";
import { PhoneEntity } from "../entities/PhoneEntity";

class PhoneRepository implements IPhoneRepository {
	private static phones: PhoneEntity[] = [];

	async create(data: ICreatePhoneRepositoryDTO): Promise<PhoneEntity> {
		const phone = new PhoneEntity({
			user_phone_id: data.user_phone_id,
			phone_number: data.phone_number,
			phone_ddd: data.phone_ddd,
		});

		PhoneRepository.phones.push(phone);

		return phone;
	}
}

export { PhoneRepository };