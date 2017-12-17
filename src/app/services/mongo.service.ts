import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {FailsafeReport} from '../data-model/failsafe-reports';
import {DailyReportJob} from '../data-model/daily-report-job';
import { environment } from '../../environments/environment';
import {isUndefined} from 'util';

@Injectable()
export class MongoService {
  private baseUrl = `http://${environment.backend_server}:${environment.backend_port}/api`;
  constructor(private http: HttpClient) { }

  getFailsafeReports(jobName: string, buildId: string): Observable<FailsafeReport[]> {
    const url = `${this.baseUrl}/failsafereports/${jobName}/${buildId}`;
    return this.http.get<FailsafeReport[]>(url);
  }

  getDailyReports(date?: Date): Observable<DailyReportJob[]> {
    let queryDate: string;
    let url: string;
    if (isUndefined(date)) {
       url = `${this.baseUrl}/dailyReports`;
    }else {
      const d = new Date(date.setDate(date.getDate() - 1));
      queryDate = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
      url = `${this.baseUrl}/dailyReports?start=${queryDate}`;
    }

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
