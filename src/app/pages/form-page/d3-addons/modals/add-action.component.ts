import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../../components';
import { IA, ResponseObj } from '../../../../interfaces';
import { AjaxService, LogService } from '../../../../services';
import { alertConfirm, filterByName } from '../../../../utils';

@Component({
  selector: 'app-add-action',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Add Action</h5>
      <!-- <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
        <span aria-hidden="true">&times;</span>
      </button> -->
    </div>
    <div class="modal-body" [formGroup]="form">
      <div class="row">
        <div class="col-xl-7 col-lg-9 col-12 mx-auto">
          <div class="row">
            <div class="col-md-12">
              <div class="form-group row">
                <div class="col-md-4">
                  <label class="col-form-label mb-0">
                    Priority
                  </label>
                </div>
                <div class="col-md-8 d-flex align-items-center">
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      id="customCheck"
                      formControlName="priority"
                      name="example1"
                    />
                    <label class="custom-control-label" for="customCheck"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <nxp-input
                title="Action Type"
                type="text"
                [parentForm]="form"
                color="bg-success"
                control="actionType"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <nxp-input
                title="Target Date"
                type="date"
                [parentForm]="form"
                control="targetDate"
                [submit]="submit"
                [minDate]="minDate"
              ></nxp-input>
            </div>
          </div>
          <div formArrayName="actionOwners" class="row" *ngFor="let formArr of actionOwners.controls; let i = index">
            <div [formGroupName]="i" [ngClass]="{ 'ml-auto': i > 0, 'col-md-8': i > 0, 'col-md-12': i === 0 }">
              <nxp-users
                *ngIf="i === 0"
                title="Action Owner"
                type="text"
                [parentForm]="formArr"
                control="actionOwner"
                [submit]="submit"
                (change)="onOwnerChange(i, $event)"
              ></nxp-users>
              <nxp-users
                *ngIf="i > 0"
                typeInput="input"
                [parentForm]="formArr"
                control="actionOwner"
                [submit]="submit"
                (change)="onOwnerChange(i, $event)"
              ></nxp-users>
              <button
                *ngIf="i === actionOwners.length - 1"
                (click)="addOwner()"
                style="top: 3px;position: absolute;right: 0;margin-right: -1.25rem;"
                class="btn btn-sm btn-success"
              >
                <i class="fa fa-plus"></i>
              </button>
              <button
                *ngIf="i < actionOwners.length - 1"
                (click)="delOwner(i)"
                style="top: 3px;position: absolute;right: 0;margin-right: -1.25rem;"
                class="btn btn-sm btn-danger"
              >
                <i class="fa fa-times"></i>
              </button>
              <button
                *ngIf="i === actionOwners.length - 1 && i !== 0"
                (click)="delOwner(i)"
                style="top: 3px;position: absolute;right: 0;margin-right: -3.25rem;"
                class="btn btn-sm btn-danger"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>
          <div formArrayName="actionDrivers" class="row" *ngFor="let formArr of actionDrivers.controls; let i = index">
            <div [formGroupName]="i" [ngClass]="{ 'ml-auto': i > 0, 'col-md-8': i > 0, 'col-md-12': i === 0 }">
              <nxp-users
                *ngIf="i === 0"
                title="Action Driver"
                type="text"
                [parentForm]="formArr"
                control="actionDriver"
                [submit]="submit"
              ></nxp-users>
              <nxp-users
                *ngIf="i > 0"
                typeInput="input"
                [parentForm]="formArr"
                control="actionDriver"
                [submit]="submit"
              ></nxp-users>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <div class="form row">
                <div class="col-md-12">
                  <label class="col-form-label mb-0">Assign Detail</label>
                </div>
                <div class="col-md-12">
                  <textarea
                    id="actionDetail"
                    formControlName="actionDetail"
                    class="form-control"
                    [ngClass]="{
                      'is-invalid': form.get('actionDetail').invalid && submit
                    }"
                    rows="3"
                    [ngStyle]="{ 'font-weight': '500' }"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="row" *ngIf="data">
            <div class="col-md-12">
              <div class="form row">
                <div class="col-md-12">
                  <label class="col-form-label mb-0">Change Action Detail</label>
                </div>
                <div class="col-md-12">
                  <textarea
                    id="changeActionDetail"
                    formControlName="changeActionDetail"
                    class="form-control"
                    [ngClass]="{
                      'is-invalid': form.get('changeActionDetail').invalid && submit
                    }"
                    rows="3"
                    [ngStyle]="{ 'font-weight': '500' }"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button id="btnIaActionSubmit" type="button" class="btn btn-sm btn-primary mr-2" (click)="onSave()">
        <i class="fa fa-save mr-1"></i> Save
      </button>
      <button id="btnIaActionCancel" type="button" class="btn btn-sm btn-light" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class D3AddActionComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  data: IA = null;
  ackDate: any = null;
  submit: boolean = false;
  filter = filterByName;
  actionOwners: FormArray;
  actionDrivers: FormArray;
  public minDate: Date = moment().toDate();
  public event: EventEmitter<IA> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-addons (modal)');

    this.form = this.fb.group({
      actionId: [null],
      actionDetail: [null, Validators.required],
      actionType: [{ value: 'IA', disabled: true }, Validators.required],
      targetDate: [new Date(), Validators.required],
      priority: [false, Validators.required],
      createBy: [null],
      changeActionDetail: [null],
      actionOwners: this.fb.array([]),
      actionDrivers: this.fb.array([])
    });
    this.actionOwners = this.form.get('actionOwners') as FormArray;
    this.actionDrivers = this.form.get('actionDrivers') as FormArray;
    this.addOwner();
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.get('actionId').patchValue(this.data.actionId);
      this.form.get('actionDetail').patchValue(this.data.actionDetail);
      this.form.get('actionDetail').disable();
      this.form.get('changeActionDetail').setValidators([Validators.required]);
      this.form.get('changeActionDetail').updateValueAndValidity();
    }
    this.setDate();
  }

  onSave(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const data = this.form.getRawValue();
          data.targetDate = moment(data.targetDate)
            .add(1, 'day')
            .toDate();
          data.status = 'NEW'; // Default : NEW
          if (data.actionId) {
            data.actionId = 0;
            data.actionDetail = data.changeActionDetail;
          }
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  addOwner(): void {
    this.actionOwners = this.form.get('actionOwners') as FormArray;
    this.actionOwners.push(
      this.fb.group({
        id: [0],
        actionOwner: [null, Validators.required],
        supervisorId: [null],
        role: ['OWNER', Validators.required],
        wbi: [null]
      })
    );
  }

  delOwner(idx: number): void {
    const { supervisorId } = this.actionOwners.getRawValue()[idx];
    this.actionOwners.removeAt(idx);
    const actionOwners: any[] = this.actionOwners.getRawValue().filter(obj => obj.supervisorId === supervisorId);
    if (actionOwners.length === 0) {
      const i: number = this.actionDrivers
        .getRawValue()
        .findIndex(obj => obj.actionDriver.split(' ')[0] === supervisorId);
      if (i > -1) {
        this.actionDrivers.removeAt(i);
      }
    }
  }

  async onOwnerChange(i, evt) {
    const empId: string = this.actionOwners
      .at(i)
      .get('actionOwner')
      .value.split(' ')[0];
    if (empId) {
      const { supervisorId } = this.actionOwners.getRawValue()[i];
      const actionOwners: any[] = this.actionOwners.getRawValue().filter(obj => obj.supervisorId === supervisorId);
      if (actionOwners.length === 1) {
        const idx: number = this.actionDrivers
          .getRawValue()
          .findIndex(obj => obj.actionDriver.split(' ')[0] === supervisorId);
        if (idx > -1) {
          this.actionDrivers.removeAt(idx);
        }
      }
      const response: ResponseObj = await this.ajax.getSupervisorById(empId).toPromise();
      if (response.status === 200) {
        if (response.data.empId) {
          const idx: number = this.actionDrivers
            .getRawValue()
            .findIndex(obj => obj.actionDriver.split(' ')[0] === response.data.empId);
          if (idx === -1) {
            this.actionDrivers.push(
              this.fb.group({
                id: [0],
                actionDriver: [{ value: response.data.name, disabled: true }, Validators.required],
                role: ['DRIVER', Validators.required],
                wbi: [response.data.username]
              })
            );
          }
        }
        if (this.actionOwners.at(i) && this.actionOwners.at(i).get('supervisorId')) {
          this.actionOwners
            .at(i)
            .get('supervisorId')
            .patchValue(response.data.empId);
        }
      }
    }
    // if (evt && typeof evt === 'string') {
    // const empId: string = evt.split(' ')[0];
    // } else {
    //   const { supervisorId } = this.actionOwners.getRawValue()[i];
    //   const actionOwners: any[] = this.actionOwners.getRawValue().filter(obj => obj.supervisorId === supervisorId);
    //   if (actionOwners.length === 1) {
    //     const idx: number = this.actionDrivers
    //       .getRawValue()
    //       .findIndex(obj => obj.actionDriver.split(' ')[0] === supervisorId);
    //     if (idx > -1) {
    //       this.actionDrivers.removeAt(idx);
    //     }
    //   }
    // }
  }

  private setDate(): void {
    if (this.ackDate) {
      const date: Date = new Date(this.ackDate);
      const newDate: any = moment(date).add(3, 'days');
      // const str1: string = newDate.format('DD-MM-YYYY');
      // const str2: string = moment().format('DD-MM-YYYY');
      // const fact: boolean = moment(str1).isSame(str2);
      this.form.get('targetDate').patchValue(newDate.toDate());
    }
  }
}
