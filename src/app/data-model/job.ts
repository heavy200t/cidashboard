export class Job {
  name: string;
  url: string;
  phase: string;
  running: boolean;
  latestBuild: number;
  result: string;
  lastUpdTime: Date;
}
