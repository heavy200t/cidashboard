import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MongoService} from './services/mongo.service';
import { TestResultComponent } from './test-result/test-result.component';


@NgModule({
  declarations: [
    AppComponent,
    TestResultComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [MongoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
