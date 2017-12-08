import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {DailyReport} from '../data-model/daily-report';
import {DailyReportJob} from '../data-model/daily-report-job';
import {DailyReportJobDetail} from '../data-model/daily-report-job-detail';

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.css']
})
export class DailyReportComponent implements OnInit {
  jobs: DailyReportJob[];

  constructor(private mongoService: MongoService) { }

  ngOnInit() {
    this.mongoService.getDailyReports().
    subscribe(res => this.jobs = res.jobs );
  }

  getJobs() {
    return this.jobs;
  }

  getJobDetails(job: DailyReportJob) {
    return job.detail;
  }
}
