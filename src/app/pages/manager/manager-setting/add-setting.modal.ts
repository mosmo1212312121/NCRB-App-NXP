import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { Parameter } from '../../../interfaces';
import { AuthService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, filterByName } from '../../../utils';

@Component({
  selector: 'app-setting-modal-add',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">{{ title }}</h5>
    </div>
    <div class="modal-body">
      <div class="row" [formGroup]="form">
        <div class="col-md-8 mx-auto">
          <div class="row">
            <div class="col-12">
              <nxp-input title="Label" type="text" [parentForm]="form" control="label" [submit]="submit"></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-12" *ngIf="!isUserValue">
              <nxp-input title="Value" type="text" [parentForm]="form" control="value" [submit]="submit"></nxp-input>
            </div>
            <div class="col-12" *ngIf="isUserValue">
              <nxp-users title="Value" type="input" [parentForm]="form" control="value" [submit]="submit"></nxp-users>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button type="button" class="btn btn-sm btn-primary mx-1" (click)="onSubmit()">
        <i class="fa fa-save mr-1"></i> Submit
      </button>
      <button type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class AddSettingModalComponent extends BaseComponent implements OnInit {
  title: string = 'Add Parameter';
  form: FormGroup;
  data: Parameter = null;
  submit: boolean = false;
  filter = filterByName;
  public event: EventEmitter<NxpSelection> = new EventEmitter();
  constructor(
    private auth: AuthService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private router: Router,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/setting-add-management (modal)');

    this.form = this.fb.group({
      id: [null],
      label: [{ value: null, disabled: true }, Validators.required],
      value: [null, Validators.required],
      ptype: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form = this.fb.group({
        id: [null],
        label: [{ value: this.data.label, disabled: true }, Validators.required],
        value: [null, Validators.required],
        ptype: [this.data.ptype, Validators.required]
      });
    }
  }

  onSubmit(): void {
    // TOOD
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const data: NxpSelection = this.form.getRawValue();
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  get isUserValue() {
    switch (this.form.get('ptype').value) {
      case 'PERSON':
        return true;
      case 'PERSON_GROUP':
        return true;
      default:
        return false;
    }
  }
}
