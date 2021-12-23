import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { LogService } from '../../../services';
import { RejectNameService } from '../../../services/reject-name.service';
import { alertConfirm } from '../../../utils';

@Component({
  selector: 'app-manage-role-user-modal',
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
          <div formArrayName="users" class="row">
            <div class="col-md-12" *ngFor="let user of users.controls; let i = index" [formGroupName]="i">
              <nxp-input
                *ngIf="i < users.controls.length - 1"
                class="pr-4"
                type="text"
                typeInput="input"
                [parentForm]="user"
                [group]="i"
                [submit]="submit"
                control="name"
                maxlength="100"
              ></nxp-input>
              <button
                *ngIf="i < users.controls.length - 1"
                (click)="onDelete(i)"
                style="z-index: 9999;right: 0;top: 0.175rem;position:absolute"
                class="btn btn-sm btn-danger"
              >
                <i class="fa fa-close"></i>
              </button>
              <nxp-users
                *ngIf="i === users.controls.length - 1"
                class="pr-4"
                type="text"
                typeInput="input"
                [parentForm]="user"
                [group]="i"
                [submit]="submit"
                control="name"
                maxlength="100"
              ></nxp-users>
              <button
                *ngIf="i === users.controls.length - 1"
                (click)="onAdd()"
                style="z-index: 9999;right: 0;top: 0.175rem;position:absolute"
                class="btn btn-sm btn-success"
              >
                <i class="fa fa-plus"></i>
              </button>
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
export class ManagerRoleUserModalComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  users: FormArray;
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
    this.setPageName('management/role-management (user modal)');

    this.form = this.fb.group({
      rid: 0,
      name: [{ value: '', disabled: true }, Validators.required],
      label: [{ value: '', disabled: true }, Validators.required],
      users: this.fb.array([])
    });
    this.users = this.form.get('users') as FormArray;
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
      this.users = this.form.get('users') as FormArray;
      for (let i = 0; i < this.data.users.length; i++) {
        this.users.push(
          this.fb.group({
            urId: { value: this.data.users[i].urId, disabled: true },
            empId: { value: this.data.users[i].empId, disabled: true },
            username: { value: this.data.users[i].username, disabled: true },
            name: { value: this.data.users[i].name, disabled: true }
          })
        );
      }
      this.users.push(
        this.fb.group({
          urId: [{ value: 0, disabled: true }, Validators.required],
          empId: [{ value: '', disabled: true }, Validators.required],
          username: [{ value: '', disabled: true }, Validators.required],
          name: [{ value: '', disabled: false }, Validators.required]
        })
      );
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

  public onAdd() {
    this.users.push(
      this.fb.group({
        urId: [{ value: 0, disabled: true }, Validators.required],
        empId: [{ value: '', disabled: true }, Validators.required],
        username: [{ value: '', disabled: true }, Validators.required],
        name: [{ value: '', disabled: false }, Validators.required]
      })
    );
  }

  public onDelete(idx: number) {
    const user: any = (this.users.at(idx) as FormGroup).getRawValue();
    this.users.removeAt(idx);

    console.log('Remove user at[' + idx + ']: ', user);
  }
}
