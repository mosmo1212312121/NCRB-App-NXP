import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { User } from '../../../interfaces';
import { LogService } from '../../../services';
import { filterByName } from '../../../utils';

@Component({
  selector: 'app-fubyqa-approval',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">FU/QA Approval</h5>
    </div>
    <div class="modal-body" [formGroup]="form">
      <div class="row">
        <div class="col-lg-6 col-md-8 mx-auto">
          <div class="row">
            <div class="col-12">
              <nxp-users
                title="Your name"
                type="text"
                [parentForm]="form"
                control="name"
                [submit]="submit"
                (change)="onChange($event)"
              ></nxp-users>
            </div>
            <div class="col-12" [ngClass]="{ hidden: !reject }">
              <nxp-input title="Reason" type="text" [parentForm]="form" control="reason" [submit]="submit"></nxp-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button type="button" class="btn btn-sm btn-success mx-1" (click)="onApprove()">
        <i class="fa fa-check mr-1"></i> Approve
      </button>
      <button type="button" class="btn btn-sm btn-danger mx-1" (click)="onReject()">
        <i class="fa fa-times mr-1"></i> Reject
      </button>
      <button type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-ban mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class FUbyQaApprovalComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  filter = filterByName;
  name: string = '';
  reject: boolean = false;
  submit: boolean = false;
  user: User = null;
  public event: EventEmitter<string> = new EventEmitter();
  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder, private logService: LogService) {
    // initial component
    super(logService);
    this.setPageName('enter-name (modal)');

    this.form = this.fb.group({
      name: [null, Validators.required],
      reason: [null]
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.user ? this.user.name : null, Validators.required],
      reason: [null]
    });
  }

  async onApprove() {
    this.submit = true;

    // not required reject
    this.reject = false;
    this.form.get('reason').clearValidators();
    this.form.get('reason').updateValueAndValidity();

    // checking valid form
    if (this.form.valid) {
      if (this.form.getRawValue().name.split(' ').length === 4) {
        const data: any = { name: this.form.getRawValue().name, result: true };
        this.event.emit(data);
        this.bsModalRef.hide();
      } else {
        this.form.get('name').setErrors(Validators.nullValidator);
        this.form.updateValueAndValidity();
      }
    }
  }

  async onReject() {
    this.submit = true;

    // required reject
    this.reject = true;
    this.form.get('reason').setValidators([Validators.required]);
    this.form.get('reason').updateValueAndValidity();

    // checking valid form
    if (this.form.valid) {
      const { name, reason } = this.form.getRawValue();
      if (name.split(' ').length === 4) {
        const data: any = { name: name, reason: reason, result: false };
        this.event.emit(data);
        this.bsModalRef.hide();
      } else {
        this.form.get('name').setErrors(Validators.nullValidator);
        this.form.updateValueAndValidity();
      }
    }
  }

  onCancel() {
    this.bsModalRef.hide();
  }

  onChange(event) {
    const name: string = this.form.getRawValue().name;
    if (event) {
      if (event.toString().toUpperCase() === name.toUpperCase()) {
        this.submit = true;
        this.form.get('name').setErrors(Validators.nullValidator);
        this.form.updateValueAndValidity();
      } else if (event.toString().toUpperCase() !== name.toUpperCase() && event.toString().split(' ').length === 4) {
        this.form.get('name').clearValidators();
        this.form.updateValueAndValidity();
      }
    }
  }
}
