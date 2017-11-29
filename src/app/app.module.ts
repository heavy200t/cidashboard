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
import {AccordionModule} from 'ngx-bootstrap';



@NgModule({
  declarations: [
    AppComponent,
    TestResultComponent,
    DashboardComponent,
    JobListComponent,
    BuildListComponent,
  ],
  imports: [
    BrowserModule,
    AgGridModule.withComponents([]),
    AccordionModule.forRoot(),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [MongoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
