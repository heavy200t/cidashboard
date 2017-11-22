export class FailsafeReport {
  buildId: string;
  branchName: string;
  testReportUrl: string;
  testFailed: boolean;
  category: string;
  markedUnstable: boolean;
  testClassName: string;
  exceptionStacktrace: string;
  testDuration: Number;
  errorMessage: string;
  exceptionType: string;
  testName: string;
  jobName: string;
  insertionTime: Date;
}
