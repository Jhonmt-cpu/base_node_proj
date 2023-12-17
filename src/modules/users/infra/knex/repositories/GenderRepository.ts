import {
  ICreateGenderDTO,
  IGenderRepository,
} from "../../../repositories/IGenderRepository";
import { GenderEntity } from "../entities/GenderEntity";

class GenderRepository implements IGenderRepository {
  private static genders: GenderEntity[] = [];

  async create(data: ICreateGenderDTO): Promise<GenderEntity> {
    const gender = new GenderEntity({
      gender_id: GenderRepository.genders.length + 1,
      gender_name: data.gender_name,
      gender_created_at: new Date(),
    });

    GenderRepository.genders.push(gender);

    return gender;
  }
}

export { GenderRepository };
