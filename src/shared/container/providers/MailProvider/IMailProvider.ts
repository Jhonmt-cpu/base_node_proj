import { ISendMailDTO } from "./dtos/ISendMailDTO";

type IMailProvider = {
  sendMail(data: ISendMailDTO): Promise<void>;
};

export { IMailProvider };
