import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../../components';
import { LogService } from '../../../../services';

@Component({
  selector: 'app-add-user-group',
  templateUrl: './add-user-group.component.html'
})
export class AddUserGroupComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  public event: EventEmitter<any> = new EventEmitter();
  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder, private logService: LogService) {
    // initial component
    super(logService);
    this.setPageName('management/user-group-add-management (modal)');

    this.form = this.fb.group({
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
  ngOnInit() {}

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
