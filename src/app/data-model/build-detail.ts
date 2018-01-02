export class BuildDetailId {
  category: string;
  reportUrl: string;
}

export class BuildDetail {
  _id: BuildDetailId;
  type: string;
  total: number;
  pass: number;
  fail: number;
  pass_percent: number;
  fail_percent: number;
  unstable_percent: number;
  combinedCategory: string;
  unstable: number;
}
