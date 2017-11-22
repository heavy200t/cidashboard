import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MongoService} from './services/mongo.service';
import { TestResultComponent } from './test-result/test-result.component';
import {AgGridModule} from 'ag-grid-angular';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    TestResultComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AgGridModule.withComponents([]),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [MongoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
