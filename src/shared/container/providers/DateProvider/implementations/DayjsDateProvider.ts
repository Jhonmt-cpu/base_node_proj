import dayjs from "dayjs";

import { IDateProvider, IStartDateEndDate } from "../IDateProvider";

class DayjsDateProvider implements IDateProvider {
  dateNow(): Date {
    return dayjs().toDate();
  }

  getDifferenceInYears({ start_date, end_date }: IStartDateEndDate): number {
    return dayjs(end_date).diff(start_date, "year");
  }

  addDays(days: number): Date {
    return dayjs().add(days, "day").toDate();
  }

  addMinutes(minutes: number): Date {
    return dayjs().add(minutes, "minute").toDate();
  }

  addSeconds(seconds: number): Date {
    return dayjs().add(seconds, "second").toDate();
  }

  isBeforeNow(date: Date): boolean {
    return dayjs(date).isBefore(dayjs());
  }

  getDifferenceInSeconds({ start_date, end_date }: IStartDateEndDate): number {
    return dayjs(end_date).diff(start_date, "second");
  }
}

export { DayjsDateProvider };
