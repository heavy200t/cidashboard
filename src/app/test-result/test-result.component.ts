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

  result: DailyReportJob;

  combinedPass(data) {return [data.pass, '(', data.pass_percent, '%)'].join(''); }
  combinedFail(data) {return [data.fail, '(', data.fail_percent, '%)'].join(''); }
  combinedUnstable(data) {return [data.unstable, '(', data.unstable_percent, '%)'].join(''); }
  categoryWithLink(data) {return {'link': data._id.reportUrl, 'category': data.combinedCategory}; }

  constructor(private mongoService: MongoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jobName = this.route.snapshot.paramMap.get('jobName');
    this.buildId = this.route.snapshot.paramMap.get('buildId');
    this.mongoService.getTestResult(this.jobName, this.buildId).subscribe(res => {
      this.result = res;
    });
  }
}
