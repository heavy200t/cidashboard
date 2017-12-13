import {DailyReportJobDetail} from './daily-report-job-detail';

export class DailyReportJobId {
  jobName: string;
  buildId: string;
}

export class DailyReportJob {
  _id: DailyReportJobId;
  total: number;
  pass: number;
  fail: number;
  unstable: number;
  startTime: Date;
  detail: DailyReportJobDetail[];
}
