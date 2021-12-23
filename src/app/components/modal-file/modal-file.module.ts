import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalFileComponent } from './modal-file.component';

@NgModule({
  declarations: [ModalFileComponent],
  imports: [CommonModule, ModalModule.forRoot()],
  exports: [ModalFileComponent],
  providers: [],
  entryComponents: [ModalFileComponent]
})
export class ModalFileModule {}
