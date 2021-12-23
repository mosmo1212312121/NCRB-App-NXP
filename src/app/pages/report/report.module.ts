import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormPageModule } from '../form-page/form-page.module';
import { ReportAllDetailComponent } from './report-all-detail.component';
import { ReportEPLevelComponent } from './report-ep-level.component';
import { ReportRoutingModule } from './report-routing.module';
import { ReportTop10Component } from './report-top-10.component';
import { ReportTop5Component } from './report-top-5.component';
import { ReportTPTAnalysisComponent } from './report-tpt-analysis.component';

@NgModule({
  imports: [
    CommonModule,
    ReportRoutingModule,
    /* page components */
    FormPageModule
    /* page components */
  ],
  declarations: [
    ReportAllDetailComponent,
    ReportEPLevelComponent,
    ReportTop10Component,
    ReportTop5Component,
    ReportTPTAnalysisComponent
  ]
})
export class ReportModule {}
