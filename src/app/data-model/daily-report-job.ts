import {DailyReportJobDetail} from './daily-report-job-detail';

export class DailyReportJob {
  jobName: String;
  buildId: number;
  total: number;
  pass: number;
  fail: number;
  detail: DailyReportJobDetail[];
}
