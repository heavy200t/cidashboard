export class DailyReportJobDetailId {
  category: string;
  reportUrl: string;
}

export class DailyReportJobDetail {
  _id: DailyReportJobDetailId;
  type: string;
  total: number;
  pass: number;
  fail: number;
  unstable: number;
}
