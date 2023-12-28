import {
  ICreatePhoneRepositoryDTO,
  IPhoneRepository,
  IUpdatePhoneRepositoryDTO,
} from "@modules/users/repositories/IPhoneRepository";

import { dbConnection } from "@shared/infra/database/knex";

import { PhoneEntity } from "../entities/PhoneEntity";

class PhoneRepository implements IPhoneRepository {
  async create(data: ICreatePhoneRepositoryDTO): Promise<PhoneEntity> {
    const phone = await dbConnection<PhoneEntity>("tb_phones")
      .insert({
        user_phone_id: data.user_phone_id,
        phone_number: data.phone_number,
        phone_ddd: data.phone_ddd,
      })
      .returning("*");

    return phone[0];
  }

  async findByDDDAndNumber({
    phone_ddd,
    phone_number,
  }: ICreatePhoneRepositoryDTO): Promise<PhoneEntity | undefined> {
    const phone = await dbConnection<PhoneEntity>("tb_phones")
      .select("*")
      .where({
        phone_ddd,
        phone_number,
      })
      .first();

    return phone;
  }

  async findById(user_phone_id: number): Promise<PhoneEntity | undefined> {
    const phone = await dbConnection<PhoneEntity>("tb_phones")
      .select("*")
      .where({
        user_phone_id,
      })
      .first();

    return phone;
  }

  async update({
    user_phone_id,
    updateFields,
  }: IUpdatePhoneRepositoryDTO): Promise<PhoneEntity> {
    const phone = await dbConnection<PhoneEntity>("tb_phones")
      .update(updateFields)
      .where({
        user_phone_id,
      })
      .returning("*");

    return phone[0];
  }
}

export { PhoneRepository };
