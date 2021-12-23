import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContainmentActionComponent } from './action/containment.action';

const routes: Routes = [
  {
    path: 'action/:id',
    component: ContainmentActionComponent,
    data: {
      title: 'Containment action'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContainmentRoutingModule {}
