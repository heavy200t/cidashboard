import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {ActivatedRoute} from '@angular/router';
import {DailyReportJob} from '../data-model/daily-report-job';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  jobName: string;
  buildId: string;
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

  result: DailyReportJob;

  constructor(private mongoService: MongoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jobName = this.route.snapshot.paramMap.get('jobName');
    this.buildId = this.route.snapshot.paramMap.get('buildId');
    this.mongoService.getTestResult(this.jobName, this.buildId).subscribe(res => {
      this.result = res;
    });
  }
}
