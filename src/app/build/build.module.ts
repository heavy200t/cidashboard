import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildRoutingModule } from './build-routing.module';
import { BuildDetailComponent } from './build-detail/build-detail.component';
import {DxLinearGaugeModule, DxPieChartModule} from 'devextreme-angular';
import {LinkComponent} from '../daily-report/link/link.component';
import {AgGridModule} from 'ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    DxLinearGaugeModule,
    DxPieChartModule,
    AgGridModule.withComponents([LinkComponent]),
    BuildRoutingModule
  ],
  declarations: [BuildDetailComponent]
})
export class BuildModule { }
