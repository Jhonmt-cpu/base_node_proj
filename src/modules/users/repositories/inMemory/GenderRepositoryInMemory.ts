import { IFindAllPaginatedDTO } from "@modules/users/@types/IFindAllPaginatedDTO";
import { ICreateGenderDTO } from "@modules/users/@types/iCreateGenderDTO";
import { GenderEntity } from "@modules/users/infra/knex/entities/GenderEntity";

import { IGenderRepository } from "../IGenderRepository";

class GenderRepositoryInMemory implements IGenderRepository {
  private genders: GenderEntity[] = [];

  async create(data: ICreateGenderDTO): Promise<GenderEntity> {
    const gender = new GenderEntity({
      gender_id: this.genders.length + 1,
      gender_name: data.gender_name,
      gender_created_at: new Date(),
    });

    this.genders.push(gender);

    return gender;
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllPaginatedDTO): Promise<GenderEntity[]> {
    const gender = this.genders.slice((page - 1) * limit, page * limit);

    return gender;
  }

  async findAll(): Promise<GenderEntity[]> {
    return this.genders;
  }

  async findById(gender_id: number): Promise<GenderEntity | undefined> {
    const gender = this.genders.find(
      (gender) => gender.gender_id === gender_id,
    );

    return gender;
  }
}

export { GenderRepositoryInMemory };
