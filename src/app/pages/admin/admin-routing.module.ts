import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuardService } from '../../services';
import { AdminUserManageComponent } from './admin-user-manage/admin-user-manage.component';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    data: {
      title: 'Administrator'
    },
    canActivate: [AdminGuardService],
    children: [
      {
        data: {
          title: 'Users Management'
        },
        path: 'user-management',
        component: AdminUserManageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
