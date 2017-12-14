import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {DailyReportJob} from '../data-model/daily-report-job';
import {GridOptions} from 'ag-grid';
import {isUndefined} from 'util';
import {LinkComponent} from './link/link.component';

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
  areas: CategoryCount[] = [];

  combineCategory (c, t) {
    let ret = c;
    if (!isUndefined(t)) {
      ret += '[' + t + ']';
    }
    return ret;
  }

  getPercent(value: number, total: number) {
    return Math.round(value * 10000 / total) / 100;
  }

  constructor(private mongoService: MongoService) {
    this.gridOptions = <GridOptions>{};
  }

  ngOnInit() {
    this.mongoService.getDailyReports().
    subscribe(res => this.jobs = res );
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
      {headerName: 'Unstable', valueGetter: function(params) {
        const data = params.data;
        return data.unstable + '(' + data.unstable_percent + '%)';
      }}
    ];
  }

  getJobDetails(job: DailyReportJob) {
    job.detail.forEach(i => {
      i.combinedCategory = this.combineCategory(i._id.category, i.type);
      i.pass_percent = this.getPercent(i.pass, i.total);
      i.fail_percent = this.getPercent(i.fail, i.total);
      i.unstable_percent = this.getPercent(i.unstable, i.total);
    });
    return job.detail;
  }

  countByCategory(job: DailyReportJob) {
    const data = this.areas;
    job.detail.forEach(i => {
      // const category = i._id.category;
      const found = data.find(item => item.category === i._id.category);
      if (isUndefined(found)) {
        data.push({category: i._id.category, cnt: 1});
      } else {
        found.cnt += 1;
      }
    });

    return data;

  }
}
