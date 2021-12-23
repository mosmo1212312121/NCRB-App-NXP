import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NxpLoaderModule } from 'nxp-loader';
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule, NxpUsersModule } from '../../components';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminUserManageComponent } from './admin-user-manage/admin-user-manage.component';
import { AdminUserModalComponent } from './admin-user-manage/modal/admin-user-modal.component';
import { AdminComponent } from './admin.component';

@NgModule({
  imports: [
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    ChartsModule,
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    /* page components */
    /* page components */
    /* custom components */
    NxpAutocompleteModule,
    NxpInputModule,
    NxpScoreModule,
    NxpLoaderModule,
    NxpUsersModule
    /* custom components */
  ],
  declarations: [AdminComponent, AdminUserManageComponent, AdminUserModalComponent],
  entryComponents: [AdminUserModalComponent]
})
export class AdminModule {}
