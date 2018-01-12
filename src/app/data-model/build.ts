
import {BuildDetail} from './build-detail';

export class BuildId {
  jobName: string;
  buildId: string;
}

export class Build {
  _id: BuildId;
  buildId: string;
  url: string;
  result: string;
  building: boolean;
  total: number;
  pass: number;
  pass_percent: number;
  fail: number;
  fail_percent: number;
  unstable: number;
  unstable_percent: number;
  startTime: Date;
  description: string;
  detail: BuildDetail[];
  duration: number;
}
