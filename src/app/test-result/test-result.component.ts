import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {FailsafeReport} from '../data-model/failsafe-reports';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  columnDefs = [
    {headerName: 'Job Name', field: 'jobName'},
    {headerName: 'Build Id', field: 'buildId'},
    {headerName: 'Test Class', field: 'testClassName'},
  ];

  failsafeReports: FailsafeReport[];

  constructor(private mongoService: MongoService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const jobName = this.route.snapshot.paramMap.get('jobName');
    const buildId = this.route.snapshot.paramMap.get('buildId');
    this.mongoService.getFailsafeReports(jobName, buildId).subscribe(res => this.failsafeReports = res);
  }
}
