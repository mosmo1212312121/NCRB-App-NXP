import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NxpLoaderComponent } from './nxp-loader.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    TypeaheadModule.forRoot()
  ],
  declarations: [NxpLoaderComponent],
  exports: [NxpLoaderComponent]
})
export class NxpLoaderModule {}
