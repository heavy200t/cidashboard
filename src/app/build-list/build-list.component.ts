// TODO: Add change list.
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
  builds_duration: Build[];
  date: Date;

  constructor(
    private mongoService: MongoService,
    private route: ActivatedRoute,
    private router: Router) { }

  localeDateTimeString(date: Date) {
    let d: Date;
    d = new Date(date);
    return d.toLocaleTimeString();
  }

  statusImage(build: Build) {
    if (build.building) {
      return 'running.gif';
    } else {
      switch (build.result) {
        case 'SUCCESS': return 'blue.png';
        case 'UNSTABLE': return 'yellow.png';
        case 'FAILURE': return 'red.png';
        // default: console.log(build.result);
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

  parseDuration(duration: number) {
    let t: number;
    t = duration / 1000;
    let hour, min, sec: number;
    hour = Math.floor(t / 3600);
    t = t - hour * 3600;
    min = Math.floor(t / 60);
    t = t - min * 60;
    sec = Math.floor(t / 60);
    return {'hour': hour, 'min': min, 'sec': sec};
  }

  displayedDuration(duration: number) {
    if (!isUndefined(duration)) {
      const d = this.parseDuration(duration);
      return [d.hour, d.min, d.sec].join(':');
    }
  }

  customizeText = (arg: any) => {
    return this.displayedDuration(parseInt(arg.value, 0));
  };

  jobStatus(job) {
    if (job.running) {
      return 'Running';
    } else {
      return job.result;
    }
  }

  hasBuilds() {
    return !(isUndefined(this.builds) || this.builds.length === 0);
  }

  gotoResult(build: Build) {
    this.router.navigate(['/result', build._id.jobName, build._id.buildId]);
  }

  customizePoint(arg: any) {
    // console.log(arg);
    switch (arg.tag) {
      case 'SUCCESS': return { image: {url: '../../assets/blue.png', width: 20, height: 20}, visible: true};
      case 'UNSTABLE': return { image: {url: '../../assets/yellow.png', width: 20, height: 20}, visible: true};
      case 'FAILURE': return { image: {url: '../../assets/red.png', width: 20, height: 20}, visible: true};
    }
  }

  // getBuildById(buildId: string) {
  //   return this.builds.find(b => b.buildId === buildId);
  // }

  ngOnInit() {
    if (this.route.snapshot.params.hasOwnProperty('date'))  {
      this.date = new Date(this.route.snapshot.paramMap.get('date'));
    } else {
      this.date = new Date();
    }
    this.mongoService.getBuilds(this.job.name, this.date).subscribe(res => {
      this.builds = res;
      this.builds_duration = this.builds.filter(b => b.building === false);
      this.builds.forEach(item => {
        item.buildId = item._id.buildId.toString();
      });
    });
  }
}
