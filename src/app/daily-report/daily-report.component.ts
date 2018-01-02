import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {DailyReportJob} from '../data-model/daily-report-job';
import {GridOptions} from 'ag-grid';
import {isUndefined} from 'util';
import {LinkComponent} from './link/link.component';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';

export class CategoryCount {
  category: string;
  cnt: number;
}

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.css']
})
export class DailyReportComponent implements OnInit {
  gridOptions: GridOptions;
  jobs: DailyReportJob[];
  columnDefs: any[];
  date: Date;

  constructor(private mongoService: MongoService, private route: ActivatedRoute) {
    this.gridOptions = <GridOptions>{};
  }

  ngOnInit() {
    let getReports: Observable<DailyReportJob[]>;
    if (this.route.snapshot.params.hasOwnProperty('date'))  {
      this.date = new Date(this.route.snapshot.paramMap.get('date'));
      getReports = this.mongoService.getDailyReports(this.date);
    } else {
      getReports = this.mongoService.getDailyReports();
    }


    getReports.subscribe(res => this.jobs = res );
    this.columnDefs = [
      { headerName: 'Category',
        width: 410,
        valueGetter: function(params) {
          return {'category': params.data.combinedCategory, 'reportUrl': params.data._id.reportUrl}; },
        cellRendererFramework: LinkComponent},
      {headerName: 'Total', field: 'total'},
      {headerName: 'Pass', valueGetter: function(params) {
        const data = params.data;
        return data.pass + '(' + data.pass_percent  + '%)';
      }},
      {headerName: 'Fail', valueGetter: function(params) {
        const data = params.data;
        return data.fail + '(' + data.fail_percent + '%)';
      }},
      {headerName: 'Skipped', valueGetter: function(params) {
        const data = params.data;
        return data.unstable + '(' + data.unstable_percent + '%)';
      }}
    ];
  }

  getJobDetails(job: DailyReportJob) {
    return job.detail;
  }
}
