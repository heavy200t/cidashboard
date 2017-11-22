import {FailsafeReport} from './data-model/failsafe-reports';

export const TESTDATA: FailsafeReport[] = [{
  testFailed : false,
  buildId : 946,
  branchName : 'master',
  testReportUrl : 'http://sh-maas-jenkins-master.hpeswlab.net:8080/jenkins/job/' +
  'MaaS-Job-Tests-Integration-Server-USB-SNB-PR2-XSP2/GIT_BRANCH=master,' +
  'GIT_REPOSITORY=itsma-x,TEST=acceptance-and-qa-flows,jdk=jdk-8u74,label_exp=linux_slave/4497/testReport',
  category : 'MaaS-SAW-Aggregator-Integration-Tests-Runner-USB-SNB-PR2-XSP2/SNB_sync/acceptance-and-qa-flows',
  markedUnstable : false,
  testClassName : 'com.hp.automation.junit.slt.SltRecordTargetsUpdateTestAcc',
  exceptionStacktrace : '',
  testDuration : 0.0,
  errorMessage : '',
  exceptionType : '',
  testName : 'testTwoDefaultSlas',
  jobName : 'ITSMA-PR-X',
  insertionTime : new Date('2017-11-22T04:21:38.201Z')
},

  /* 2 */
  {
    testFailed : false,
    buildId : 946,
    branchName : 'master',
    testReportUrl : 'http://sh-maas-jenkins-master.hpeswlab.net:8080/jenkins/job/' +
    'MaaS-Job-Tests-Integration-Server-USB-SNB-PR2-XSP2/GIT_BRANCH=master,' +
    'GIT_REPOSITORY=itsma-x,TEST=acceptance-and-qa-flows,jdk=jdk-8u74,label_exp=linux_slave/4497/testReport',
    category : 'MaaS-SAW-Aggregator-Integration-Tests-Runner-USB-SNB-PR2-XSP2/SNB_sync/acceptance-and-qa-flows',
    markedUnstable : false,
    testClassName : 'com.hp.automation.junit.slt.SltRecordTargetsUpdateTestAcc',
    exceptionStacktrace : '',
    testDuration : 3.79900002479553,
    errorMessage : '',
    exceptionType : '',
    testName : 'emptySnapTudTest',
    jobName : 'ITSMA-PR-X',
    insertionTime : new Date('2017-11-22T04:21:38.201Z')
  }];
