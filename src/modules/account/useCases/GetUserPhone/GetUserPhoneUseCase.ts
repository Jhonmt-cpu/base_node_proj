import { inject, injectable } from "tsyringe";

import { IFindUserPhoneByIdDTO } from "@modules/account/@types/IFindUserPhoneByIdDTO";
import { IPhoneRepository } from "@modules/account/repositories/IPhoneRepository";
import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

@injectable()
class GetUserPhoneUseCase {
  constructor(
    @inject("PhoneRepository")
    private phoneRepository: IPhoneRepository,
  ) {}

  async execute({ user_id }: IFindUserPhoneByIdDTO) {
    const phone = await this.phoneRepository.findById(user_id);

    if (!phone) {
      throw new AppError(AppErrorMessages.USER_PHONE_NOT_FOUND, 404);
    }

    return phone;
  }
}

export { GetUserPhoneUseCase };
