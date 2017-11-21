import {Component, OnInit} from '@angular/core';
import {FailsafeReport} from './failsafe-reports';
import {MongoService} from './mongo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  failsafeReports: FailsafeReport[];

  constructor(private mongoService: MongoService) {}
  ngOnInit(): void {
    this.mongoService.getFailsafeReports().subscribe(res => this.failsafeReports = res);
  }
}
