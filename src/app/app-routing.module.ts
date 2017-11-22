import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TestResultComponent} from './test-result/test-result.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'result/:jobName/:buildId', component: TestResultComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule]
})
export class AppRoutingModule { }
