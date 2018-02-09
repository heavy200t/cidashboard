
let schema_Test = `
type Test {
  jobName: String
  buildId: Int
  testClassName: String
  testName: String
  insertionTime: String
  testReportUrl: String
  category: String
  testDuration: Float
  testFailed: Boolean
  markedUnstable: Boolean
  exceptionType: String
  exceptionStackTrace: String
  errorMessage: String
}`;

class Test {
  constructor(test) {
    this.jobName = test.jobName;
    this.buildId = test.buildId;
    this.testClassName = test.testClassName;
    this.testName = test.testName;
    this.insertionTime = test.insertionTime;
    this.testReportUrl = test.testReportUrl;
    this.category = test.category;
    this.testDuration = test.testDuration;
    this.testFailed = test.testFailed;
    this.markedUnstable = test.markedUnstable;
    this.exceptionType = test.exceptionType;
    this.exceptionStackTrace = test.exceptionType;
    this.errorMessage = test.errorMessage;
  }
}

module.exports = { Test, schema_Test };
