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
  pass_percent: number;
  fail_percent: number;
  unstable_percent: number;
  unstable: number;
}
