import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {MongoService} from './services/mongo.service';
import { TestResultComponent } from './test-result/test-result.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {HttpClientModule} from '@angular/common/http';
import {AgGridModule} from 'ag-grid-angular';
import { JobListComponent } from './job-list/job-list.component';
import { BuildListComponent } from './build-list/build-list.component';
import {AccordionModule, ProgressbarModule} from 'ngx-bootstrap';
import { DailyReportComponent } from './daily-report/daily-report.component';
import {DxChartModule, DxLinearGaugeModule, DxPieChartModule} from 'devextreme-angular';
import { LinkComponent } from './daily-report/link/link.component';



@NgModule({
  declarations: [
    AppComponent,
    TestResultComponent,
    DashboardComponent,
    JobListComponent,
    BuildListComponent,
    DailyReportComponent,
    LinkComponent,
  ],
  imports: [
    BrowserModule,
    DxPieChartModule,
    DxLinearGaugeModule,
    DxChartModule,
    AgGridModule.withComponents([LinkComponent]),
    AccordionModule.forRoot(),
    ProgressbarModule.forRoot(),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [MongoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
