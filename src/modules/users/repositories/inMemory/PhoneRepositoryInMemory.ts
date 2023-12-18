import { PhoneEntity } from "@modules/users/infra/knex/entities/PhoneEntity";

import {
  ICreatePhoneRepositoryDTO,
  IPhoneRepository,
} from "../IPhoneRepository";

class PhoneRepositoryInMemory implements IPhoneRepository {
  private phones: PhoneEntity[] = [];

  async create(data: ICreatePhoneRepositoryDTO): Promise<PhoneEntity> {
    const phone = new PhoneEntity({
      user_phone_id: data.user_phone_id,
      phone_number: data.phone_number,
      phone_ddd: data.phone_ddd,
      phone_updated_at: new Date(),
    });

    this.phones.push(phone);

    return phone;
  }
}

export { PhoneRepositoryInMemory };
