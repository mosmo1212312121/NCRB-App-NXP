import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NxpLoaderModule } from '../../components/nxp-loader/nxp-loader.module';
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule } from '../../components';
import { ModalDetailModule } from '../../components/modal-detail/modal-detail.module';
import { FormPageModule } from '../form-page/form-page.module';
import { FinanceApprovalComponent } from './approval/approval.component';
import { FinanceCostComponent } from './cost/cost.component';
import { FinanceRoutingModule } from './finance-routing.module';

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
    FinanceRoutingModule,
    ModalDetailModule
  ],
  declarations: [FinanceCostComponent, FinanceApprovalComponent],
  exports: [],
  providers: [CurrencyPipe, { provide: DEFAULT_CURRENCY_CODE, useValue: 'USD' }]
})
export class FinanceModule {}
