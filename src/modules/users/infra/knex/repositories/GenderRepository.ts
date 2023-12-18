import { dbConnection } from "@shared/infra/database/knex";

import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { ICreateGenderDTO } from "@modules/users/@types/iCreateGenderDTO";
import { IGenderRepository } from "@modules/users/repositories/IGenderRepository";

import { GenderEntity } from "../entities/GenderEntity";

class GenderRepository implements IGenderRepository {
  async create(data: ICreateGenderDTO): Promise<GenderEntity> {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .insert({
        gender_name: data.gender_name,
      })
      .returning("*");

    return gender[0];
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllPaginatedDTO): Promise<GenderEntity[]> {
    const genders = await dbConnection<GenderEntity>("tb_genders")
      .select("*")
      .limit(limit)
      .offset((page - 1) * limit);

    return genders;
  }
}

export { GenderRepository };
