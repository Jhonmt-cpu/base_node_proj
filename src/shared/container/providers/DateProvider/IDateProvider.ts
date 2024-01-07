type IStartDateEndDate = {
  start_date: Date;
  end_date: Date;
};

type IDateProvider = {
  dateNow(): Date;
  getDifferenceInYears(data: IStartDateEndDate): number;
  getDifferenceInSeconds(data: IStartDateEndDate): number;
  addDays(days: number): Date;
  addSeconds(seconds: number): Date;
  isBeforeNow(date: Date): boolean;
};

export { IDateProvider, IStartDateEndDate };
