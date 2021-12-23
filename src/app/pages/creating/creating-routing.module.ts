import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatingComponent } from './creating.component';

const routes: Routes = [
  {
    path: '',
    component: CreatingComponent,
    data: {
      title: 'Creating'
    }
  },
  {
    path: ':id',
    component: CreatingComponent,
    data: {
      title: 'Creating With ID'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatingRoutingModule {}
