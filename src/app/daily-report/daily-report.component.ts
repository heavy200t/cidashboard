import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {DailyReport} from '../data-model/daily-report';
import {DailyReportJob} from '../data-model/daily-report-job';
import {DailyReportJobDetail} from '../data-model/daily-report-job-detail';
import {GridOptions} from 'ag-grid';

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.css']
})
export class DailyReportComponent implements OnInit {
  gridOptions: GridOptions;
  jobs: DailyReportJob[];
  columnDefs: any[];

  constructor(private mongoService: MongoService) {
    this.gridOptions = <GridOptions>{};
  }

  ngOnInit() {
    this.mongoService.getDailyReports().
    subscribe(res => this.jobs = res );
    this.columnDefs = [
      {headerName: 'Category', valueGetter: function(params){
        const data = params.data;
        return data._id.category + '[' + data._id.type + ']';
      }},
      {headerName: 'Total', field: 'total'},
      {headerName: 'Pass', valueGetter: function(params) {
        const data = params.data;
        return data.pass + '(' + data.pass_percent  + '%)';
      }},
      {headerName: 'Fail', valueGetter: function(params) {
        const data = params.data;
        return data.fail + '(' + data.fail_percent + '%)';
      }},
      {headerName: 'Unstable', valueGetter: function(params) {
        const data = params.data;
        return data.unstable + '(' + data.unstable_percent + '%)';
      }}
    ];
  }

  getJobDetails(job: DailyReportJob) {
    job.detail.forEach(i => {
      i.pass_percent = this.getPercent(i.pass, i.total);
      i.fail_percent = this.getPercent(i.fail, i.total);
      i.unstable_percent = this.getPercent(i.unstable, i.total);
    });
    return job.detail;
  }

  getPercent(value: number, total: number) {
    return Math.round(value * 10000 / total) / 100;
  }
}
