import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {DailyReportJob} from '../data-model/daily-report-job';
import { environment } from '../../environments/environment';
import {isUndefined} from 'util';
import {Job} from '../data-model/job';
import {Build} from '../data-model/build';

@Injectable()
export class MongoService {
  private baseUrl = `http://${environment.backend_server}:${environment.backend_port}/api`;
  constructor(private http: HttpClient) { }

  getQueryStringOfDate(d?: Date) {
    return (isUndefined(d)) ? '' : `start=${d.getFullYear() + '-' + (d.getMonth() + 1).toString() + '-' + d.getDate()}`;
  }

  getDailyReports(d?: Date): Observable<DailyReportJob[]> {
    return this.http.get<DailyReportJob[]>(`${this.baseUrl}/dailyReports?${this.getQueryStringOfDate(d)}`);
  }

  getJobList(): Observable<Job[]> {
    const url = `${this.baseUrl}/jobs`;
    return this.http.get<Job[]>(url);
  }

  getBuilds(jobName: string, d?: Date): Observable<Build[]> {
    return this.http.get<Build[]>(`${this.baseUrl}/${jobName}/builds?${this.getQueryStringOfDate(d)}`);
  }

  getTestResult(jobName: string, buildId: string): Observable<DailyReportJob> {
    const url = `${this.baseUrl}/job/${jobName}/${buildId}`;
    return this.http.get<DailyReportJob>(url);
  }
}
