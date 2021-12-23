import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NxpUsersComponent } from './nxp-users.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, ButtonsModule.forRoot()],
  declarations: [NxpUsersComponent],
  exports: [NxpUsersComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NxpUsersModule {}
