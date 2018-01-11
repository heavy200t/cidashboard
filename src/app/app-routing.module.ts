import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TestResultComponent} from './test-result/test-result.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {JobListComponent} from './job-list/job-list.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'job-list', component: JobListComponent},
  {path: 'job-list/:date', component: JobListComponent},
  {path: 'result/:jobName/:buildId', component: TestResultComponent},
  {path: 'dailyReport/:date', component: JobListComponent},
  {path: 'dailyReport', component: JobListComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule]
})
export class AppRoutingModule { }
