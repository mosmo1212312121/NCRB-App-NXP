import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NxpLoaderModule } from 'nxp-loader';
import {
  NxpAutocompleteModule,
  NxpInputModule,
  NxpScoreModule,
  NxpSelectModule,
  NxpUsersModule
} from '../../components';
import { ManagerAutoactionsComponent } from './manager-autoactions/manager-autoactions.component';
import { ManagerBoardApproversComponent } from './manager-board-approvers/manager-board-approvers.component';
import { ManagerBoardGroupComponent } from './manager-board-group/manager-board-group.component';
import { AddDropdownModalComponent } from './manager-dropdown/add-dropdown.modal';
import { EditDropdownModalComponent } from './manager-dropdown/edit-dropdown.modal';
import { ManagerDropdownComponent } from './manager-dropdown/manager-dropdown.component';
import { ManagerMenuComponent } from './manager-menu/manager-menu.component';
import { ManagerOwnersModalComponent } from './manager-owners/manager-owners-modal/manager-owners-modal.component';
import { ManagerOwnersComponent } from './manager-owners/manager-owners.component';
import { AddParameterModalComponent } from './manager-parameter/add-parameter.modal';
import { EditParameterModalComponent } from './manager-parameter/edit-parameter.modal';
import { ManagerParameterComponent } from './manager-parameter/manager-parameter.component';
import { ManagerRejectCriteriaComponent } from './manager-reject-criteria/manager-reject-criteria.component';
import { RejectCriteriaModalComponent } from './manager-reject-criteria/reject-criteria-modal.component';
import { ManagerRoleActionComponent } from './manager-role-action/manager-role-action.component';
import { ManagerRoleModalComponent } from './manager-role/manager-role-modal.component';
import { ManagerRoleUserModalComponent } from './manager-role/manager-role-user-modal.component';
import { ManagerRoleComponent } from './manager-role/manager-role.component';
import { ManagerRoutingModule } from './manager-routing.module';
import { EditSettingModalComponent } from './manager-setting/edit-setting.modal';
import { ManagerSettingComponent } from './manager-setting/manager-setting.component';
import { AddUserGroupComponent } from './manager-user-group/add-user-group/add-user-group.component';
import { EditUserGroupComponent } from './manager-user-group/edit-user-group/edit-user-group.component';
import { ManagerUserGroupComponent } from './manager-user-group/manager-user-group.component';
import { ManagerComponent } from './manager.component';

@NgModule({
  imports: [
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ChartsModule,
    CollapseModule.forRoot(),
    CommonModule,
    FormsModule,
    ManagerRoutingModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    ReactiveFormsModule,
    /* page components */
    /* page components */
    /* custom components */
    NxpAutocompleteModule,
    NxpInputModule,
    NxpLoaderModule,
    NxpScoreModule,
    NxpUsersModule,
    NxpSelectModule
    /* custom components */
  ],
  declarations: [
    AddDropdownModalComponent,
    AddParameterModalComponent,
    AddUserGroupComponent,
    EditDropdownModalComponent,
    EditParameterModalComponent,
    EditSettingModalComponent,
    EditUserGroupComponent,
    ManagerAutoactionsComponent,
    ManagerBoardApproversComponent,
    ManagerComponent,
    ManagerDropdownComponent,
    ManagerMenuComponent,
    ManagerOwnersComponent,
    ManagerOwnersModalComponent,
    ManagerParameterComponent,
    ManagerRejectCriteriaComponent,
    ManagerRoleActionComponent,
    ManagerRoleComponent,
    ManagerRoleModalComponent,
    ManagerRoleUserModalComponent,
    ManagerSettingComponent,
    ManagerUserGroupComponent,
    ManagerBoardGroupComponent,
    RejectCriteriaModalComponent
  ],
  entryComponents: [
    AddDropdownModalComponent,
    AddParameterModalComponent,
    AddUserGroupComponent,
    EditDropdownModalComponent,
    EditParameterModalComponent,
    EditSettingModalComponent,
    EditUserGroupComponent,
    ManagerOwnersModalComponent,
    ManagerRoleModalComponent,
    ManagerRoleUserModalComponent,
    RejectCriteriaModalComponent
  ]
})
export class ManagerModule {}
