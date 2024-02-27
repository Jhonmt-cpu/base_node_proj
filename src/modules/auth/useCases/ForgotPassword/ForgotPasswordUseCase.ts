import { inject, injectable } from "tsyringe";
import { resolve } from "path";

import auth from "@config/auth";

import { IUserRepository } from "@modules/account/repositories/IUserRepository";
import { IResetTokenRepository } from "@modules/auth/repositories/IResetTokenRepository";
import { IForgotPasswordDTO } from "@modules/auth/@types/IForgotPasswordDTO";

import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { IMailProvider } from "@shared/container/providers/MailProvider/IMailProvider";

@injectable()
class ForgotPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("ResetTokenRepository")
    private resetTokenRepository: IResetTokenRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("MailProvider")
    private mailProvider: IMailProvider,
  ) {}

  async execute({ user_email: email }: IForgotPasswordDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    await this.resetTokenRepository.deleteAllByUserId(user.user_id);

    const resetToken = await this.resetTokenRepository.create({
      reset_token_user_id: user.user_id,
      reset_token_expires_in: this.dateProvider.addDays(
        Number(auth.forgotPassword.expiresInMinutes),
      ),
    });

    const templatePath = resolve(
      __dirname,
      "..",
      "..",
      "views",
      "emails",
      "forgotPassword.hbs",
    );

    const variables = {
      name: user.user_name,
      link: `${auth.forgotPassword.callbackUrl}${resetToken.reset_token_id}`,
    };

    await this.mailProvider.sendMail({
      to: email,
      subject: "Recuperação de senha",
      variables,
      path: templatePath,
    });
  }
}

export { ForgotPasswordUseCase };
