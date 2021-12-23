import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmitLotDispositionComponent } from './lot/submit.disposition';
import { SubmitMaterialDispositionComponent } from './material/submit.disposition';

const routes: Routes = [
  {
    path: 'lot/disposition/:id',
    component: SubmitLotDispositionComponent,
    data: {
      title: 'Submit Lot disposition'
    }
  },
  {
    path: 'material/disposition/:id',
    component: SubmitMaterialDispositionComponent,
    data: {
      title: 'Submit Material disposition'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubmitRoutingModule {}
