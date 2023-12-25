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

  async findByDDDAndNumber({
    phone_ddd,
    phone_number,
  }: ICreatePhoneRepositoryDTO): Promise<PhoneEntity | undefined> {
    const phone = this.phones.find(
      (phone) =>
        phone.phone_ddd === phone_ddd && phone.phone_number === phone_number,
    );

    return phone;
  }
}

export { PhoneRepositoryInMemory };
