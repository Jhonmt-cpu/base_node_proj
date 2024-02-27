import fs from "fs";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import { injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";
import { AppErrorMessages } from "@shared/errors/AppErrorMessages";

import { ISendMailDTO } from "../dtos/ISendMailDTO";
import { IMailProvider } from "../IMailProvider";

@injectable()
class EtherealMailProvider implements IMailProvider {
  private client?: Transporter;

  async createTestAccount(): Promise<void> {
    try {
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.client = transporter;
    } catch (error) {
      console.error(error);
    }
  }

  async sendMail({
    to,
    subject,
    variables,
    path,
  }: ISendMailDTO): Promise<void> {
    if (!this.client) {
      await this.createTestAccount();

      if (!this.client) {
        throw new AppError(AppErrorMessages.ERROR_SENDING_EMAIL, 503);
      }
    }

    const templateFileContent = fs.readFileSync(path).toString("utf-8");

    const templateParse = handlebars.compile(templateFileContent);

    const templateHTML = templateParse(variables);

    const message = await this.client.sendMail({
      to,
      from: "Easy Find <noreplay@easyfind.com.br>",
      subject,
      html: templateHTML,
    });

    console.log("Message sent: %s", message.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));
  }
}

export { EtherealMailProvider };
