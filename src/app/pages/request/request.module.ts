import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NxpLoaderModule } from 'nxp-loader';
import {
  NxpAutocompleteModule,
  NxpFilterRequestModule,
  NxpInputModule,
  NxpScoreModule,
  NxpUsersModule
} from '../../components';
import { DirectivesModule } from '../../directives';
import { FormPageModule } from '../form-page/form-page.module';
import { ChangeOwnerComponent } from './modals/change-owner.component';
import { MemberComponent } from './modals/member.component';
import { MergeComponent } from './modals/merge.component';
import { OwnersComponent } from './modals/owners.component';
import { RequestCreateComponent } from './request-create.component';
import { RequestDetailComponent } from './request-detail.component';
import { RequestMyIssueComponent } from './request-my-issue-nc.component';
import { RequestMyMemberComponent } from './request-my-member-nc.component';
import { RequestMyOwnerComponent } from './request-my-owner-nc.component';
import { RequestRoutingModule } from './request-routing.module';
import { RequestComponent } from './request.component';

@NgModule({
  imports: [
    BsDatepickerModule.forRoot(),
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ChartsModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    CollapseModule.forRoot(),
    ReactiveFormsModule,
    RequestRoutingModule,
    /* page components */
    FormPageModule,
    /* page components */
    /* custom components */
    DirectivesModule,
    NxpAutocompleteModule,
    NxpFilterRequestModule,
    NxpInputModule,
    NxpLoaderModule,
    NxpScoreModule,
    NxpUsersModule
    /* custom components */
  ],
  declarations: [
    RequestComponent,
    RequestMyIssueComponent,
    RequestMyOwnerComponent,
    RequestMyMemberComponent,
    RequestDetailComponent,
    RequestCreateComponent,
    OwnersComponent,
    ChangeOwnerComponent,
    MemberComponent,
    MergeComponent
  ],
  entryComponents: [ChangeOwnerComponent, MemberComponent, OwnersComponent, MergeComponent]
})
export class RequestModule {}
