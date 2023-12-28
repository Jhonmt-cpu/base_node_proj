import { dbConnection } from "@shared/infra/database/knex";

import {
  IGenderRepository,
  ICreateGenderRepositoryDTO,
  IFindAllGendersPaginatedRepositoryDTO,
} from "@modules/users/repositories/IGenderRepository";

import { GenderEntity } from "../entities/GenderEntity";

class GenderRepository implements IGenderRepository {
  async create(data: ICreateGenderRepositoryDTO): Promise<GenderEntity> {
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
  }: IFindAllGendersPaginatedRepositoryDTO): Promise<GenderEntity[]> {
    const genders = await dbConnection<GenderEntity>("tb_genders")
      .select("*")
      .limit(limit)
      .offset((page - 1) * limit);

    return genders;
  }

  async findAll(): Promise<GenderEntity[]> {
    const genders = await dbConnection<GenderEntity>("tb_genders").select("*");

    return genders;
  }

  async findById(gender_id: number): Promise<GenderEntity | undefined> {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .select("*")
      .where({
        gender_id,
      })
      .first();

    return gender;
  }

  async findByName(gender_name: string): Promise<GenderEntity | undefined> {
    const gender = await dbConnection<GenderEntity>("tb_genders")
      .select("*")
      .where({
        gender_name,
      })
      .first();

    return gender;
  }
}

export { GenderRepository };
