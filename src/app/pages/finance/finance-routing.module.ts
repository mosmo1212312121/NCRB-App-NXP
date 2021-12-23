import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinanceCostComponent } from './cost/cost.component';
import { FinanceApprovalComponent } from './approval/approval.component';

const routes: Routes = [
  {
    path: 'costs/:ncrbno/:group',
    component: FinanceCostComponent,
    data: {
      title: 'Costs'
    }
  },
  {
    path: 'approval/:ncrbno/:group',
    component: FinanceApprovalComponent,
    data: {
      title: 'Approval'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule {}
