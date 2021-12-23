import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NxpLoaderBoxModule } from '../nxp-loader-box/nxp-loader-box.module';
import { NxpFilterRequestComponent } from './nxp-filter-request.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ButtonsModule.forRoot(),
    NxpLoaderBoxModule
  ],
  declarations: [NxpFilterRequestComponent],
  exports: [NxpFilterRequestComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NxpFilterRequestModule {}
