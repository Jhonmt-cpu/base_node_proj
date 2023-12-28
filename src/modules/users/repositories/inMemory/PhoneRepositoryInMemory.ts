import { PhoneEntity } from "@modules/users/infra/knex/entities/PhoneEntity";

import {
  ICreatePhoneRepositoryDTO,
  IPhoneRepository,
  IUpdatePhoneRepositoryDTO,
} from "../IPhoneRepository";

import { DatabaseInMemory } from "./DatabaseInMemory";

class PhoneRepositoryInMemory implements IPhoneRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(data: ICreatePhoneRepositoryDTO): Promise<PhoneEntity> {
    const phone = new PhoneEntity({
      user_phone_id: data.user_phone_id,
      phone_number: data.phone_number,
      phone_ddd: data.phone_ddd,
      phone_updated_at: new Date(),
    });

    this.databaseInMemory.phones.push(phone);

    return phone;
  }

  async findByDDDAndNumber({
    phone_ddd,
    phone_number,
  }: ICreatePhoneRepositoryDTO): Promise<PhoneEntity | undefined> {
    const phone = this.databaseInMemory.phones.find(
      (phone) =>
        phone.phone_ddd === phone_ddd && phone.phone_number === phone_number,
    );

    return phone;
  }

  async findById(user_phone_id: number): Promise<PhoneEntity | undefined> {
    const phone = this.databaseInMemory.phones.find(
      (phone) => phone.user_phone_id === user_phone_id,
    );

    return phone;
  }

  async update({
    user_phone_id,
    updateFields,
  }: IUpdatePhoneRepositoryDTO): Promise<PhoneEntity> {
    const phoneIndex = this.databaseInMemory.phones.findIndex(
      (phone) => phone.user_phone_id === user_phone_id,
    );

    if (phoneIndex === -1) {
      throw new Error("Phone not found");
    }

    const phone = this.databaseInMemory.phones[phoneIndex];

    const phoneUpdated = {
      ...phone,
      ...updateFields,
      phone_updated_at: new Date(),
    };

    this.databaseInMemory.phones[phoneIndex] = phoneUpdated;

    return phoneUpdated;
  }
}

export { PhoneRepositoryInMemory };
