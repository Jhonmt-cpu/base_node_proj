type IStartDateEndDate = {
  start_date: Date;
  end_date: Date;
};

type IDateProvider = {
  dateNow(): Date;
  getDifferenceInYears(data: IStartDateEndDate): number;
};

export { IDateProvider, IStartDateEndDate };
