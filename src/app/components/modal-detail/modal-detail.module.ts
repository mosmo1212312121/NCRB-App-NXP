import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DragScrollModule } from 'ngx-drag-scroll';
import { NxpLoaderModule } from 'nxp-loader';
import {
  NxpAutocompleteModule,
  NxpInputModule,
  NxpLoaderBoxModule,
  NxpScoreModule,
  NxpSelectModule,
  NxpUsersModule
} from '..';
import { FormPageModule } from '../../pages/form-page/form-page.module';
import { ModalDetailComponent } from './modal-detail.component';

@NgModule({
  declarations: [ModalDetailComponent],
  imports: [
    CommonModule,
    FormPageModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AccordionModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ChartsModule,
    CollapseModule.forRoot(),
    CommonModule,
    DragDropModule,
    FormsModule,
    ModalModule.forRoot(),
    DragScrollModule,
    ReactiveFormsModule,
    /* page components */
    /* page components */
    /* custom components */
    NxpAutocompleteModule,
    NxpInputModule,
    NxpScoreModule,
    NxpLoaderModule,
    NxpLoaderBoxModule,
    NxpSelectModule,
    NxpUsersModule
    /* custom components */
  ],
  exports: [ModalDetailComponent],
  providers: [],
  entryComponents: [ModalDetailComponent]
})
export class ModalDetailModule {}
