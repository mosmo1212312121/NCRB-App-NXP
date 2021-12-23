import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportAllDetailComponent } from './report-all-detail.component';
import { ReportEPLevelComponent } from './report-ep-level.component';
import { ReportTop10Component } from './report-top-10.component';
import { ReportTop5Component } from './report-top-5.component';
import { ReportTPTAnalysisComponent } from './report-tpt-analysis.component';

const routes: Routes = [
  {
    path: 'all-detail',
    component: ReportAllDetailComponent,
    data: {
      title: 'Report All Detail'
    }
  },
  {
    path: 'ep-level',
    component: ReportEPLevelComponent,
    data: {
      title: 'Report EP Level NCRB Action'
    }
  },
  {
    path: 'top-10-ncrb',
    component: ReportTop10Component,
    data: {
      title: 'Report Top 10 by NCRB'
    }
  },
  {
    path: 'top-5-failure',
    component: ReportTop5Component,
    data: {
      title: 'Report Recurrence for Top 5 Failure'
    }
  },
  {
    path: 'tpt-analysis',
    component: ReportTPTAnalysisComponent,
    data: {
      title: 'Report TpT Analysis'
    }
  },
  {
    path: '',
    redirectTo: 'all-detail',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule {}
