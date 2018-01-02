import { Component, OnInit } from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {Job} from '../data-model/job';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})

export class JobListComponent implements OnInit {
  jobs: Job[];
  date: Date;

  constructor(private mongoService: MongoService) { }

  ngOnInit() {
    this.jobs = [];
    this.mongoService.getJobList().
    subscribe(res => this.jobs = res);

  }
}
