import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageGuardService } from '../../services';
import { ManagerAutoactionsComponent } from './manager-autoactions/manager-autoactions.component';
import { ManagerBoardApproversComponent } from './manager-board-approvers/manager-board-approvers.component';
import { ManagerBoardGroupComponent } from './manager-board-group/manager-board-group.component';
import { ManagerDropdownComponent } from './manager-dropdown/manager-dropdown.component';
import { ManagerMenuComponent } from './manager-menu/manager-menu.component';
import { ManagerOwnersComponent } from './manager-owners/manager-owners.component';
import { ManagerParameterComponent } from './manager-parameter/manager-parameter.component';
import { ManagerRejectCriteriaComponent } from './manager-reject-criteria/manager-reject-criteria.component';
import { ManagerRoleActionComponent } from './manager-role-action/manager-role-action.component';
import { ManagerRoleComponent } from './manager-role/manager-role.component';
import { ManagerSettingComponent } from './manager-setting/manager-setting.component';
import { ManagerUserGroupComponent } from './manager-user-group/manager-user-group.component';
import { ManagerComponent } from './manager.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerComponent,
    data: {
      title: 'Management'
    },
    canActivate: [ManageGuardService],
    children: [
      {
        data: {
          title: 'Dropdowns Management'
        },
        path: 'dropdown-management',
        component: ManagerDropdownComponent
      },
      {
        data: {
          title: 'Auto-Actions Management'
        },
        path: 'autoactions-management',
        component: ManagerAutoactionsComponent
      },
      {
        data: {
          title: 'Board Approvers Management'
        },
        path: 'board-approver-management',
        component: ManagerBoardApproversComponent
      },
      {
        data: {
          title: 'Board Group Management'
        },
        path: 'board-group-management',
        component: ManagerBoardGroupComponent
      },
      {
        data: {
          title: 'Reject Name Management'
        },
        path: 'reject-management',
        component: ManagerRejectCriteriaComponent
      },
      {
        data: {
          title: 'Owners Management'
        },
        path: 'owner-management',
        component: ManagerOwnersComponent
      },
      {
        data: {
          title: 'Parameters Management'
        },
        path: 'parameter-management',
        component: ManagerParameterComponent
      },
      {
        data: {
          title: 'Settings Management'
        },
        path: 'setting-management',
        component: ManagerSettingComponent
      },
      {
        data: {
          title: 'Menus Management'
        },
        path: 'menu-management',
        component: ManagerMenuComponent
      },
      {
        data: {
          title: 'Non-HR Users Management'
        },
        path: 'user-group-management',
        component: ManagerUserGroupComponent
      },
      {
        data: {
          title: 'Roles Management'
        },
        path: 'role-management',
        component: ManagerRoleComponent
      },
      {
        data: {
          title: 'Roles & Actions Management'
        },
        path: 'role-action-management',
        component: ManagerRoleActionComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule {}
