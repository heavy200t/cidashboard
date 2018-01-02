import {Component, Input, OnInit} from '@angular/core';
import {MongoService} from '../services/mongo.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Build} from '../data-model/build';
import {Job} from '../data-model/job';
import {isUndefined} from 'util';


@Component({
  selector: 'app-build-list',
  templateUrl: './build-list.component.html',
  styleUrls: ['./build-list.component.css']
})
export class BuildListComponent implements OnInit {

  @Input() job: Job;
  builds: Build[];
  date: Date;

  constructor(
    private mongoService: MongoService,
    private route: ActivatedRoute,
    private router: Router) { }

  localeDateTimeString(date: Date) {
    let d: Date;
    d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  statusImage(build: Build) {
    if (build.building) {
      return 'running.gif';
    } else {
      switch (build.result) {
        case 'SUCCESS': return 'blue.png';
        case 'UNSTABLE': return 'yellow.png';
        case 'FAILURE': return 'red.png';
        default: console.log(build.result);
      }
    }
  }

  buildStack(build: Build) {
    const ret = [];
    ret.push({
      value: build.pass,
      type: 'success',
      label: build.pass_percent + '%'
    });
    ret.push({
      value: build.fail,
      type: 'danger',
      label: build.fail_percent + '%'
    });
    return ret;
  }

  jobStatus(job) {
    if (job.running) {
      return 'Running';
    } else {
      return job.result;
    }
  }

  hasBuilds() {
    return (isUndefined(this.builds) || this.builds.length === 0);
  }

  gotoResult(build: Build) {
    this.router.navigate(['/result', build._id.jobName, build._id.buildId]);
  }

  ngOnInit() {
    if (this.route.snapshot.params.hasOwnProperty('date'))  {
      this.date = new Date(this.route.snapshot.paramMap.get('date'));
    } else {
      this.date = new Date();
    }
    this.mongoService.getBuilds(this.job.name, this.date).subscribe(res => {
      this.builds = res;
      this.builds.forEach(item => {
        item.buildId = item._id.buildId.toString();
      });
    });
  }
}
