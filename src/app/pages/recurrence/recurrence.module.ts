import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NxpLoaderModule } from '../../components/nxp-loader/nxp-loader.module';
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule, NxpUsersModule } from '../../components';
import { ModalDetailModule } from '../../components/modal-detail/modal-detail.module';
import { FormPageModule } from '../form-page/form-page.module';
import { RecurrenceComponent } from './action/recurrence.action';
import { RecurrenceRoutingModule } from './recurrence-routing.module';

@NgModule({
  imports: [
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ChartsModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    /* page components */
    FormPageModule,
    /* page components */
    /* custom components */
    NxpAutocompleteModule,
    NxpInputModule,
    NxpScoreModule,
    NxpLoaderModule,
    NxpUsersModule,
    /* custom components */
    RecurrenceRoutingModule,
    ModalDetailModule
  ],
  declarations: [RecurrenceComponent],
  exports: [],
  providers: []
})
export class RecurrenceModule {}
