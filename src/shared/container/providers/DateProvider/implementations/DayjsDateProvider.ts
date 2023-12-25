import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { IDateProvider } from "../IDateProvider";

class DayjsDateProvider implements IDateProvider {
  convertToBrazilianUTC(date: Date): Date {
    return dayjs(date).toDate();
  }
}

export { DayjsDateProvider };
