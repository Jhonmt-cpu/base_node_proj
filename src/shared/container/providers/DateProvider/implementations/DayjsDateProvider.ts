import dayjs from "dayjs";

import { IDateProvider, IStartDateEndDate } from "../IDateProvider";

class DayjsDateProvider implements IDateProvider {
  dateNow(): Date {
    return dayjs().toDate();
  }

  getDifferenceInYears({ start_date, end_date }: IStartDateEndDate): number {
    return dayjs(end_date).diff(start_date, "year");
  }
}

export { DayjsDateProvider };
