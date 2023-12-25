import { PhoneEntity } from "@modules/users/infra/knex/entities/PhoneEntity";

type ICreatePhoneRepositoryDTO = {
  user_phone_id: number;
  phone_number: number;
  phone_ddd: number;
};

type IFindByDDDAndNumberDTO = {
  phone_ddd: number;
  phone_number: number;
};

type IPhoneRepository = {
  create(data: ICreatePhoneRepositoryDTO): Promise<PhoneEntity>;
  findByDDDAndNumber(
    data: IFindByDDDAndNumberDTO,
  ): Promise<PhoneEntity | undefined>;
};

export { IPhoneRepository, ICreatePhoneRepositoryDTO };
