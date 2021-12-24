import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NxpLoaderModule } from '../../components/nxp-loader/nxp-loader.module';
import { NxpAutocompleteModule, NxpInputModule, NxpScoreModule, NxpUsersModule } from '../../components';
import { DebugRoutingModule } from './debug-routing.module';
import { DebugComponent } from './debug.component';
import { LoggingsComponent } from './loggings/loggings.component';

@NgModule({
  imports: [
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    ChartsModule,
    CommonModule,
    FormsModule,
    DebugRoutingModule,
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
  declarations: [DebugComponent, LoggingsComponent]
})
export class DebugModule {}
