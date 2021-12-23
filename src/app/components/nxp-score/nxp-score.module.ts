import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NxpScoreComponent } from './nxp-score.component';
import { CommonModule } from '@angular/common';
import { NxpInputModule } from '../nxp-input/nxp-input.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDropdownModule, ButtonsModule.forRoot(), NxpInputModule],
  declarations: [NxpScoreComponent],
  exports: [NxpScoreComponent]
})
export class NxpScoreModule {}
