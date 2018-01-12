import {Component, OnInit, ViewChild} from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {ActivatedRoute} from '@angular/router';
import {DailyReportJob} from '../data-model/daily-report-job';
import {DxDataGridComponent, DxPieChartComponent, DxPieChartModule} from 'devextreme-angular';
import {DailyReportJobDetail} from "../data-model/daily-report-job-detail";

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @ViewChild(DxPieChartComponent) pieChart: DxPieChartComponent;
  jobName: string;
  buildId: string;

  result: DailyReportJob;
  allDetail: DailyReportJobDetail[];

  combinedPass(data) {return [data.pass, '(', data.pass_percent, '%)'].join(''); }
  combinedFail(data) {return [data.fail, '(', data.fail_percent, '%)'].join(''); }
  combinedUnstable(data) {return [data.unstable, '(', data.unstable_percent, '%)'].join(''); }
  categoryWithLink(data) {return {'link': data._id.reportUrl, 'category': data.combinedCategory}; }

  doFilter(cond) {
    switch (cond) {
      case 'ALL': {
        this.result.detail = this.allDetail;
        break;
      }
      case 'FAIL': {
        this.result.detail = this.result.detail.filter(d => d.fail !== 0);
        break;
      }
    }
  }

  constructor(private mongoService: MongoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jobName = this.route.snapshot.paramMap.get('jobName');
    this.buildId = this.route.snapshot.paramMap.get('buildId');
    this.mongoService.getTestResult(this.jobName, this.buildId).subscribe(res => {
      this.result = res;
      this.allDetail = this.result.detail;
    });
  }
}
