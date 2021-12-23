import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NxpSelectComponent } from './nxp-select.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, ButtonsModule.forRoot()],
  declarations: [NxpSelectComponent],
  exports: [NxpSelectComponent]
})
export class NxpSelectModule {}
