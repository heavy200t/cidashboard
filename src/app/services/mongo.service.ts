import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {FailsafeReport} from '../data-model/failsafe-reports';
import {of} from 'rxjs/observable/of';
import {TESTDATA} from '../mock-data';
import {DailyReport} from '../data-model/daily-report';
import {DailyReportJob} from '../data-model/daily-report-job';

@Injectable()
export class MongoService {
  // private baseUrl = 'http://localhost:3000/api';
  private baseUrl = 'http://shc-devops-master.hpeswlab.net:30030/api';
  constructor(private http: HttpClient) { }

  getFailsafeReports(jobName: string, buildId: string): Observable<FailsafeReport[]> {
    const url = `${this.baseUrl}/failsafereports/${jobName}/${buildId}`;
    return this.http.get<FailsafeReport[]>(url);
  }

  getDailyReports(): Observable<DailyReportJob[]> {
    const url = `${this.baseUrl}/dailyReports`;
    console.log(url);
    return this.http.get<DailyReportJob[]>(url);
  }

  getJobList(): Observable<String[]> {
    const url = `${this.baseUrl}/jobs`;
    return this.http.get<String[]>(url);
  }

  getBuilds(jobName: string): Observable<String[]> {
    const url = `${this.baseUrl}/${jobName}/builds`;
    return this.http.get<String[]>(url);
  }
}
