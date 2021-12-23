import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NxpInputComponent } from './nxp-input.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    BsDatepickerModule.forRoot()
  ],
  declarations: [NxpInputComponent],
  exports: [NxpInputComponent]
})
export class NxpInputModule {}

export interface NxpSelection {
  [x: string]: any;
  id: number;
  label: string;
  text?: string;
  value: any;
  items?: NxpSelection[];
  createBy?: string;
}
