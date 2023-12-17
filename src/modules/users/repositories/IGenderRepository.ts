import { GenderEntity } from "../infra/knex/entities/GenderEntity";

type ICreateGenderDTO = {
  gender_name: string;
};

type IGenderRepository = {
  create(data: ICreateGenderDTO): Promise<GenderEntity>;
};

export { IGenderRepository, ICreateGenderDTO };
