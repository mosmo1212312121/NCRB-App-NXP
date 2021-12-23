import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { LogService } from '../../../services';
import { RejectNameService } from '../../../services/reject-name.service';
import { alertConfirm } from '../../../utils';

@Component({
  selector: 'app-manage-role-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Role Name</h5>
    </div>
    <div class="modal-body">
      <div class="row" [formGroup]="form">
        <div class="col-md-10 mx-auto">
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                title="Name"
                type="text"
                [parentForm]="form"
                [submit]="submit"
                control="name"
                maxlength="100"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                title="Label"
                type="text"
                [parentForm]="form"
                [submit]="submit"
                control="label"
                maxlength="100"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button type="button" class="btn btn-sm btn-primary mx-1" (click)="onSubmit()">
        <i class="fa fa-save mr-1"></i> Submit
      </button>
      <button (click)="onReset()" class="btn btn-sm btn-danger mx-1"><i class="fa fa-refresh mr-1"></i>Reset</button>
      <button type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class ManagerRoleModalComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  data: any = null;
  categories: NxpSelection[] = [];
  public event: EventEmitter<any> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private rejectService: RejectNameService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/role-management (modal)');

    this.form = this.fb.group({
      rid: 0,
      name: [{ value: '', disabled: true }, Validators.required],
      label: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  public async onSubmit() {
    // validate
    this.submit = true;

    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        const values = this.form.getRawValue();
        this.submit = false;
        this.event.emit(values);
        this.bsModalRef.hide();
      }
    }
  }

  public async onReset() {
    const result = await alertConfirm();
    if (result.value) {
      this.form.patchValue(this.data);
    }
  }

  public async onCancel() {
    this.bsModalRef.hide();
  }

  public onChange(evt) {
    // Do Something
  }
}
