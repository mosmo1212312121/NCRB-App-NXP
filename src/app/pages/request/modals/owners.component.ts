import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { Initial, Owner, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertWarning, filterByName } from '../../../utils';

@Component({
  selector: 'app-owners',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Owners</h5>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-xl-6 col-lg-8 col-md-10 mx-auto">
          <div class="form-group row" *ngFor="let owner of owners; let i = index">
            <div class="col-md-11 col-10">
              <input class="form-control" value="{{ owner.name }}" disabled />
            </div>
            <div class="col-md-1 col-2">
              <button
                *ngIf="owners.length > 1 && owner.id"
                (click)="onDeleteById(owner.id)"
                [disabled]="(ncrbid && !isOwner && !(isDraft && isRequestor)) || isAcknowledge"
                type="button"
                class="btn btn-sm btn-danger"
              >
                <i class="fa fa-trash"></i>
              </button>
              <button
                *ngIf="owners.length > 1 && !owner.id"
                (click)="onDeleteByEmpId(owner.empId)"
                [disabled]="ncrbid && !isOwner && !(isDraft && isRequestor)"
                type="button"
                class="btn btn-sm btn-danger"
              >
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="form-group row" [formGroup]="form">
            <div class="col-md-11 col-10">
              <nxp-users
                type="text"
                typeInput="input"
                [parentForm]="form"
                control="owner"
                [submit]="submit"
                (change)="onChange($event)"
              ></nxp-users>
            </div>
            <div class="col-md-1 col-2">
              <button
                (click)="onAdd()"
                [disabled]="ncrbid && !isOwner && !(isDraft && isRequestor)"
                type="button"
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
      <button type="button" class="btn btn-sm btn-light" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class OwnersComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submit: boolean = false;
  ncrbid: number = null;
  ncrbno: string = '';
  username: string = '';
  filter = filterByName;
  owners: Owner[] = [];
  request: Initial = null;
  requestSub: any = null;
  userSub: any = null;

  isOwner: boolean = false;
  isDraft: boolean = false;
  isAcknowledge: boolean = false;
  isRequestor: boolean = false;

  public event: EventEmitter<Owner[]> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private store: Store<IAppState>,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('owners (modal)');

    this.form = this.fb.group({
      owners: this.fb.array([]),
      owner: [null]
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user.empId === 'empId') {
        this.form.disable();
      }
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      this.isOwner = this.request.isOwner;
      this.isDraft = this.request.isDraft;
      this.isAcknowledge = this.request.isAcknowledge;
      this.isRequestor = this.request.isRequestor;
      if (this.ncrbid && !this.isOwner && !(this.isDraft && this.isRequestor)) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.requestSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  async onSave() {
    this.submit = true;
    if (this.form.valid) {
      try {
        const result = await alertConfirm('Make sure, your information before submit', 'Are you sure ?');
        if (result.value) {
          const data: any = this.form.getRawValue().owners;
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      } catch (ex) {
        // On Crashed
        console.error('Owners (Save) Errors: ', ex);
      }
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  onChange(event) {
    if (event) {
      const idx: number = this.owners.findIndex(obj => obj.name.toUpperCase() === event.toString().toUpperCase());
      if (idx > -1) {
        this.submit = true;
        this.form.get('owner').setErrors(Validators.nullValidator);
        this.form.updateValueAndValidity();
      } else {
        this.form.get('owner').clearValidators();
        this.form.updateValueAndValidity();
      }
    }
  }

  onDeleteById(id: number) {
    alertConfirm('Make sure your information before delete.', 'Are you sure ?', async result => {
      if (result && result.value) {
        try {
          // const response: ResponseObj = await this.ajax.removeOwner(id, this.ncrbno, this.username).toPromise();
          this.owners = this.owners.filter(obj => obj.id !== id);
          this.event.emit(this.owners);
        } catch (ex) {
          console.error('Owners (Delete) Errors: ', ex);
        }
      }
    });
  }

  onDeleteByEmpId(empId: string) {
    alertConfirm('Make sure your information before delete.', 'Are you sure ?', async result => {
      if (result && result.value) {
        try {
          // const response: ResponseObj = await this.ajax.removeOwner(id, this.ncrbno, this.username).toPromise();
          this.owners = this.owners.filter(obj => obj.empId !== empId);
          this.event.emit(this.owners);
        } catch (ex) {
          console.error('Owners (Delete) Errors: ', ex);
        }
      }
    });
  }

  onAdd() {
    if (this.owners.findIndex(obj => obj.name.toUpperCase() === this.form.getRawValue().owner) === -1) {
      alertConfirm('Make sure your information before add.', 'Are you sure ?', async result => {
        if (result && result.value) {
          try {
            const response: ResponseObj = await this.ajax
              .getUserById(this.form.getRawValue().owner.split(' ')[0])
              .toPromise();
            if (response.data && response.data.empId) {
              this.owners.push(Object.assign(response.data, { by: 'MANUAL' }));
              this.event.emit(this.owners);
            }
            this.form.get('owner').reset();
          } catch (ex) {
            console.error('Owners (Add) Errors: ', ex);
          }
        }
      });
    } else {
      alertWarning('Duplicate NCRB Owner');
    }
  }
}
