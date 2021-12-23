import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevGuardService } from '../../services';
import { DebugComponent } from './debug.component';
import { LoggingsComponent } from './loggings/loggings.component';

const routes: Routes = [
  {
    path: '',
    component: DebugComponent,
    data: {
      title: 'Debugging'
    },
    canActivate: [DevGuardService],
    children: [
      {
        data: {
          title: 'Logging'
        },
        path: 'loggings',
        component: LoggingsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebugRoutingModule {}
