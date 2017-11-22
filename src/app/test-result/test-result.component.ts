import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {FailsafeReport} from '../dataModel/failsafe-reports';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  failsafeReports: FailsafeReport[];

  constructor(private mongoService: MongoService) {}

  ngOnInit(): void {
    this.mongoService.getFailsafeReports().subscribe(res => this.failsafeReports = res);
  }
}
