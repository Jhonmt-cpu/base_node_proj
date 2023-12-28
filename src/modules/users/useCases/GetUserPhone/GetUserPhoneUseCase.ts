import { inject, injectable } from "tsyringe";

import { IFindUserPhoneByIdDTO } from "@modules/users/@types/IFindUserPhoneByIdDTO";
import { IPhoneRepository } from "@modules/users/repositories/IPhoneRepository";
import { AppError } from "@shared/errors/AppError";

@injectable()
class GetUserPhoneUseCase {
  constructor(
    @inject("PhoneRepository")
    private phoneRepository: IPhoneRepository,
  ) {}

  async execute({ user_id }: IFindUserPhoneByIdDTO) {
    const phone = await this.phoneRepository.findById(user_id);

    if (!phone) {
      throw new AppError("Phone not found", 404);
    }

    return phone;
  }
}

export { GetUserPhoneUseCase };
