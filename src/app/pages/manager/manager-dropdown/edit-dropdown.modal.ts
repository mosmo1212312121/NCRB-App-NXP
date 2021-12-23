import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { AuthService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';

@Component({
  selector: 'app-dropdown-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Edit Dropdown</h5>
    </div>
    <div class="modal-body">
      <div class="row" [formGroup]="form">
        <div class="col-md-6 mx-auto">
          <div class="row">
            <div class="col-12">
              <nxp-input title="Label" type="text" [parentForm]="form" control="label" [submit]="submit"></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <nxp-input title="Value" type="text" [parentForm]="form" control="value" [submit]="submit"></nxp-input>
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
export class EditDropdownModalComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  data: NxpSelection = null;
  submit: boolean = false;
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
    this.setPageName('management/autoactions-management (modal)');

    this.form = this.fb.group({
      id: [null],
      label: [null, Validators.required],
      value: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form = this.fb.group({
        id: [this.data.id],
        label: [this.data.label, Validators.required],
        value: [{ value: this.data.value, disabled: this.data.createBy === 'SYSTEM' }, Validators.required]
      });
    }
  }

  onSubmit(): void {
    // TOOD
    this.submit = true;
    if (this.form.valid) {
      const data: NxpSelection = this.form.getRawValue();
      this.event.emit(data);
      this.bsModalRef.hide();
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
