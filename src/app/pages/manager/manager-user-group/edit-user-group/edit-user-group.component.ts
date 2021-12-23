import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../../components';
import { User } from '../../../../interfaces';
import { LogService } from '../../../../services';

@Component({
  selector: 'app-edit-user-group',
  templateUrl: './edit-user-group.component.html'
})
export class EditUserGroupComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  data: User;
  public event: EventEmitter<any> = new EventEmitter();
  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder, private logService: LogService) {
    // initial component
    super(logService);
    this.setPageName('management/user-group-edit-management (modal)');

    this.form = this.fb.group({
      id: [null],
      empId: [null, Validators.required],
      email: [null, Validators.required],
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      username: [null, Validators.required],
      department: [null],
      supervisorId: [null],
      tel: [null]
    });
  }
  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  onSubmit(): void {
    this.submit = true;
    if (this.form.valid) {
      this.event.emit(this.form.getRawValue());
      this.bsModalRef.hide();
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
