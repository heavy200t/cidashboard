import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {ActivatedRoute} from '@angular/router';
import {DailyReportJob} from '../data-model/daily-report-job';
import {LinkComponent} from "../daily-report/link/link.component";

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  jobName: string;
  buildId: string;
  columnDefs = [
    { headerName: 'Category',
      width: 420,
      valueGetter: function(params) {
        return {'category': params.data.combinedCategory, 'reportUrl': params.data._id.reportUrl}; },
      cellRendererFramework: LinkComponent},
    {headerName: 'Total', width: 160, field: 'total'},
    {headerName: 'Pass', width: 160, valueGetter: function(params) {
      const data = params.data;
      return data.pass + '(' + data.pass_percent  + '%)';
    }},
    {headerName: 'Fail', width: 160, valueGetter: function(params) {
      const data = params.data;
      return data.fail + '(' + data.fail_percent + '%)';
    }},
    {headerName: 'Unstable', width: 160, valueGetter: function(params) {
      const data = params.data;
      return data.unstable + '(' + data.unstable_percent + '%)';
    }}
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
