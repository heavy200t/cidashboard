import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {FailsafeReport} from '../dataModel/failsafe-reports';

@Injectable()
export class MongoService {
  private url = 'http://localhost:3000/api/failsafereports';

  constructor(private http: HttpClient) { }

  getFailsafeReports(): Observable<FailsafeReport[]> {
    return this.http.get<FailsafeReport[]>(this.url);
  }

}
