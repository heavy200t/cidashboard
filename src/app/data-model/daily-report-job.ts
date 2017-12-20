import {DailyReportJobDetail} from './daily-report-job-detail';

export class DailyReportJobId {
  jobName: string;
  buildId: string;
}

export class DailyReportJob {
  _id: DailyReportJobId;
  total: number;
  pass: number;
  pass_percent: number;
  fail: number;
  fail_percent: number;
  unstable: number;
  unstable_percent: number;
  startTime: Date;
  detail: DailyReportJobDetail[];
}
