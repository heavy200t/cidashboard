import {Component, Input, OnInit} from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {FailsafeReport} from '../data-model/failsafe-reports';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  @Input() jobName: string;
  @Input() buildId: string;
  columnDefs = [
    {headerName: 'Test Class', field: 'testClassName', suppressSizeToFit: true},
    {headerName: 'Test Name', field: 'testName'},
    {headerName: 'Pass', valueGetter: function (params) {
      return !params.testFailed;
    }},
    {headerName: 'Category', field: 'category'},
    {headerName: 'Duration', valueGetter: function (params) {
      return Math.round(params.data.testDuration * 100) / 100;
    }},
  ];

  failsafeReports: FailsafeReport[];

  constructor(private mongoService: MongoService) {}

  ngOnInit(): void {
    this.mongoService.getFailsafeReports(this.jobName, this.buildId).subscribe(res => this.failsafeReports = res);
  }
}
