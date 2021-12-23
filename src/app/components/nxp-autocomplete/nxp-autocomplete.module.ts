import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NxpAutocompleteComponent } from './nxp-autocomplete.component';
import { CommonModule } from '@angular/common';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    TypeaheadModule.forRoot()
  ],
  declarations: [NxpAutocompleteComponent],
  exports: [NxpAutocompleteComponent]
})
export class NxpAutocompleteModule {}
