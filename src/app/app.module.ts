import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {MongoService} from './services/mongo.service';
import { TestResultComponent } from './test-result/test-result.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {HttpClientModule} from '@angular/common/http';
import { JobListComponent } from './job-list/job-list.component';
import { BuildListComponent } from './build-list/build-list.component';
import {AccordionModule, ProgressbarModule} from 'ngx-bootstrap';
import {DxChartModule, DxDataGridModule, DxLinearGaugeModule, DxPieChartModule} from 'devextreme-angular';



@NgModule({
  declarations: [
    AppComponent,
    TestResultComponent,
    DashboardComponent,
    JobListComponent,
    BuildListComponent
  ],
  imports: [
    BrowserModule,
    DxPieChartModule,
    DxLinearGaugeModule,
    DxDataGridModule,
    DxChartModule,
    AccordionModule.forRoot(),
    ProgressbarModule.forRoot(),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [MongoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
