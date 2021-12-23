import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecurrenceComponent } from './action/recurrence.action';

const routes: Routes = [
  {
    path: 'action/:id',
    component: RecurrenceComponent,
    data: {
      title: 'Prevent Recurrence'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecurrenceRoutingModule {}
