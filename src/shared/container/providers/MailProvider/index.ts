import { container } from "tsyringe";
import { EtherealMailProvider } from "./implementations/EtherealMailProvider";
import { IMailProvider } from "./IMailProvider";

type MailOptions = {
  [key: string]: IMailProvider;
};

const mailProvider: MailOptions = {
  ethereal: container.resolve(EtherealMailProvider),
};

container.registerInstance<IMailProvider>(
  "MailProvider",
  mailProvider[process.env.MAIL_PROVIDER || "ethereal"],
);
