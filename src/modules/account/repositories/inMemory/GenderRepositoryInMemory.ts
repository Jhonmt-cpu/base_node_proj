import { DatabaseInMemory } from "@shared/repositories/inMemory/DatabaseInMemory";

import { GenderEntity } from "@modules/account/infra/knex/entities/GenderEntity";

import {
  IGenderRepository,
  ICreateGenderRepositoryDTO,
  IFindAllGendersPaginatedRepositoryDTO,
} from "../IGenderRepository";

class GenderRepositoryInMemory implements IGenderRepository {
  constructor(private databaseInMemory: DatabaseInMemory) {}

  async create(data: ICreateGenderRepositoryDTO): Promise<GenderEntity> {
    const gender = new GenderEntity({
      gender_id: this.databaseInMemory.genders.length + 1,
      gender_name: data.gender_name,
      gender_created_at: new Date(),
    });

    this.databaseInMemory.genders.push(gender);

    return gender;
  }

  async findAllPaginated({
    page,
    limit,
  }: IFindAllGendersPaginatedRepositoryDTO): Promise<GenderEntity[]> {
    const gender = this.databaseInMemory.genders.slice(
      (page - 1) * limit,
      page * limit,
    );

    return gender;
  }

  async findAll(): Promise<GenderEntity[]> {
    return this.databaseInMemory.genders;
  }

  async findById(gender_id: number): Promise<GenderEntity | undefined> {
    const gender = this.databaseInMemory.genders.find(
      (gender) => gender.gender_id === gender_id,
    );

    return gender;
  }

  async findByName(gender_name: string): Promise<GenderEntity | undefined> {
    const gender = this.databaseInMemory.genders.find(
      (gender) => gender.gender_name === gender_name,
    );

    return gender;
  }
}

export { GenderRepositoryInMemory };
