import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorrectivetActionComponent } from './action/corrective.action';

const routes: Routes = [
  {
    path: 'action/:id',
    component: CorrectivetActionComponent,
    data: {
      title: 'Corrective action'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorrectiveRoutingModule {}
