import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {FailsafeReport} from '../data-model/failsafe-reports';
import {of} from 'rxjs/observable/of';
import {TESTDATA} from '../mock-data';

@Injectable()
export class MongoService {
  private baseUrl = 'http://localhost:3000/api/';
  constructor(private http: HttpClient) { }

  getFailsafeReports(jobName: string, buildId: string): Observable<FailsafeReport[]> {
    const url = `${this.baseUrl}failsafereports/${jobName}/${buildId}`;
    return this.http.get<FailsafeReport[]>(url);
  }

  getJobList(): Observable<String[]> {
    const url = `${this.baseUrl}joblist`;
    return this.http.get<String[]>(url);
  }

  // getFailsafeReports(jobName: string, buildId: string): Observable<FailsafeReport[]> {
  //   return of(TESTDATA);
  // }

}
