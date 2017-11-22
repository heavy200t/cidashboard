import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {FailsafeReport} from '../data-model/failsafe-reports';

@Injectable()
export class MongoService {

  constructor(private http: HttpClient) { }

  getFailsafeReports(jobName: string, buildId: string): Observable<FailsafeReport[]> {
    const url = `http://localhost:3000/api/failsafereports/${jobName}/${buildId}`;
    return this.http.get<FailsafeReport[]>(url);
  }

}
