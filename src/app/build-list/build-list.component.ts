import {Component, Input, OnInit} from '@angular/core';
import {MongoService} from '../services/mongo.service';

@Component({
  selector: 'app-build-list',
  templateUrl: './build-list.component.html',
  styleUrls: ['./build-list.component.css']
})
export class BuildListComponent implements OnInit {

  @Input() jobName: string;
  builds: String[];
  isCollapsed: boolean;

  constructor(private mongoService: MongoService) { }

  ngOnInit() {
    this.mongoService.getBuilds(this.jobName).subscribe(res => this.builds = res.slice(0, 5));
  }
}
