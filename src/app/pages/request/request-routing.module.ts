import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService, PendingChangesGuard } from '../../services';
import { RequestCreateComponent } from './request-create.component';
import { RequestDetailComponent } from './request-detail.component';
import { RequestMyIssueComponent } from './request-my-issue-nc.component';
import { RequestMyMemberComponent } from './request-my-member-nc.component';
import { RequestMyOwnerComponent } from './request-my-owner-nc.component';
import { RequestComponent } from './request.component';

const routes: Routes = [
  {
    path: 'list',
    component: RequestComponent,
    data: {
      title: 'Requests'
    }
  },
  {
    path: 'mylists',
    data: {
      title: 'My Requests'
    },
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'issue',
        component: RequestMyIssueComponent,
        data: {
          title: 'My issue NC'
        },
        canActivate: [AuthGuardService]
      },
      {
        path: 'owner',
        component: RequestMyOwnerComponent,
        data: {
          title: 'My owner NC'
        },
        canActivate: [AuthGuardService]
      },
      {
        path: 'member',
        component: RequestMyMemberComponent,
        data: {
          title: 'My member NC'
        },
        canActivate: [AuthGuardService]
      }
    ]
  },
  {
    path: 'create',
    component: RequestCreateComponent,
    data: {
      title: 'Create Request'
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'detail/:id',
    component: RequestDetailComponent,
    data: {
      title: 'Request Detail'
    }
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule {}
