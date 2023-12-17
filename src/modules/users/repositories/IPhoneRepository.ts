import { PhoneEntity } from "../infra/knex/entities/PhoneEntity";

type ICreatePhoneRepositoryDTO = {
  user_phone_id: number;
  phone_number: number;
  phone_ddd: number;
}

type IPhoneRepository = {
  create(data: ICreatePhoneRepositoryDTO): Promise<PhoneEntity>;
}

export { IPhoneRepository, ICreatePhoneRepositoryDTO };