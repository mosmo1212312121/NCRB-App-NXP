import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
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
} from '../../components';
import { ModalFileModule } from '../../components/modal-file/modal-file.module';
import { D1Component } from './d1/d1.component';
import { D2LotComponent } from './d2-lot/d2-lot.component';
import { D2MaterialComponent } from './d2-material/d2-material.component';
import { D2AddMaterialComponent } from './d2-material/modals/d2-add-material.component';
import { D2Component } from './d2/d2.component';
import { D3AddonsComponent } from './d3-addons/d3-addons.component';
import { D3AddActionComponent } from './d3-addons/modals/add-action.component';
import { D3InstructionComponent } from './d3-instruction/d3-instruction.component';
import { AddInstructionComponent } from './d3-instruction/modals/add-instruction';
import { FUbyQaApprovalComponent } from './d3-lot/approval.component';
import { D3LotComponent } from './d3-lot/d3-lot.component';
import { EnterResultComponent } from './d3-lot/result.component';
import { D3MaterialComponent } from './d3-material/d3-material.component';
import { D3MinutesComponent } from './d3-minutes/d3-minutes.component';
import { D3AddMomComponent } from './d3-minutes/modals/add-mom.component';
import { D3QaComponent } from './d3-qa/d3-qa.component';
import { D3Component } from './d3/d3.component';
import { D4Component } from './d4/d4.component';
import { D5AddonsComponent } from './d5-addons/d5-addons.component';
import { D5AddActionComponent } from './d5-addons/modals/add-action.component';
import { D6Component } from './d6/d6.component';
import { D7AddonsComponent } from './d7-addons/d7-addons.component';
import { D7AddActionComponent } from './d7-addons/modals/add-action.component';
import { D8Component } from './d8/d8.component';
import { HistoryComponent } from './history/history.component';

@NgModule({
  declarations: [
    AddInstructionComponent,
    D1Component,
    D2AddMaterialComponent,
    D2Component,
    D2LotComponent,
    D2MaterialComponent,
    D3AddActionComponent,
    D3AddMomComponent,
    D3AddonsComponent,
    D3Component,
    D3InstructionComponent,
    D3LotComponent,
    D3MaterialComponent,
    D3MinutesComponent,
    D3QaComponent,
    D4Component,
    D5AddActionComponent,
    D5AddonsComponent,
    D6Component,
    D7AddActionComponent,
    D7AddonsComponent,
    D8Component,
    HistoryComponent,
    FUbyQaApprovalComponent,
    EnterResultComponent
  ],
  imports: [
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
    NxpUsersModule,
    ModalFileModule
    /* custom components */
  ],
  exports: [
    D1Component,
    D2AddMaterialComponent,
    D2Component,
    D2LotComponent,
    D2MaterialComponent,
    D3AddonsComponent,
    D3Component,
    D3InstructionComponent,
    D3LotComponent,
    D3MaterialComponent,
    D3MinutesComponent,
    D3QaComponent,
    D4Component,
    D5AddonsComponent,
    D6Component,
    D7AddonsComponent,
    D8Component,
    HistoryComponent
  ],
  entryComponents: [
    D2AddMaterialComponent,
    D3AddActionComponent,
    D3AddMomComponent,
    D5AddActionComponent,
    D7AddActionComponent,
    AddInstructionComponent,
    FUbyQaApprovalComponent,
    EnterResultComponent
  ],
  providers: [CurrencyPipe, { provide: DEFAULT_CURRENCY_CODE, useValue: 'USD' }]
})
export class FormPageModule {}
