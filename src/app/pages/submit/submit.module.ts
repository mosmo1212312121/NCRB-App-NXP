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
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule } from '../../components';
import { FormPageModule } from '../form-page/form-page.module';
import { SubmitLotDispositionComponent } from './lot/submit.disposition';
import { SubmitMaterialDispositionComponent } from './material/submit.disposition';
import { SubmitRoutingModule } from './submit-routing.module';

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
    /* custom components */
    SubmitRoutingModule
  ],
  declarations: [SubmitLotDispositionComponent, SubmitMaterialDispositionComponent],
  exports: [],
  providers: []
})
export class SubmitModule {}
