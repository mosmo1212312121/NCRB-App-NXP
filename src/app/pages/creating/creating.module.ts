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
import { NxpLoaderModule } from '../../components/nxp-loader/nxp-loader.module';
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule } from '../../components';
import { FormPageModule } from '../form-page/form-page.module';
import { CreatingRoutingModule } from './creating-routing.module';
import { CreatingComponent } from './creating.component';
import { HotTableModule } from '@handsontable/angular';

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
    CreatingRoutingModule,
    HotTableModule.forRoot(),
    /* page components */
    FormPageModule,
    /* page components */
    /* custom components */
    NxpAutocompleteModule,
    NxpInputModule,
    NxpScoreModule,
    NxpLoaderModule
    /* custom components */
  ],
  declarations: [CreatingComponent]
})
export class CreatingModule {}
