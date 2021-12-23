import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { Initial, Member, ResponseObj, User } from '../../../interfaces';
import { AjaxService, AuthService, LogService } from '../../../services';
import { setrequest } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertWarning, filterByName } from '../../../utils';

@Component({
  selector: 'app-member',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Members</h5>
    </div>
    <div class="modal-body">
      <div class="row" [formGroup]="form">
        <div class="col-md-8 mx-auto">
          <div class="row">
            <div class="col-9">
              <nxp-users
                title="Search Member"
                type="text"
                [parentForm]="form"
                control="member"
                [submit]="submit"
              ></nxp-users>
            </div>
            <div class="col-3 d-flex align-items-end pl-0 pb-3">
              <button
                type="button"
                class="btn btn-light"
                *ngIf="!this.isOwner && !(this.isDraft && this.isRequestor)"
                disabled
              >
                <i class="fa fa-plus mr-1"></i> Add
              </button>
              <button
                type="button"
                class="btn btn-light"
                *ngIf="!(!this.isOwner && !(this.isDraft && this.isRequestor))"
                (click)="onAdd()"
              >
                <i class="fa fa-plus mr-1"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="table-responsive">
            <table class="table table-sm table-hover table-bordered">
              <thead>
                <tr class="text-center">
                  <th>#</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Tel</th>
                  <th>E-mail</th>
                  <th>Roles</th>
                  <th>ActionName</th>
                  <th style="width: 52.5px"></th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-center" *ngFor="let member of members; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>{{ member.empId }}</td>
                  <td>{{ member.shortname }}</td>
                  <td>{{ member.department }}</td>
                  <td>{{ member.tel }}</td>
                  <td>{{ member.email }}</td>
                  <td>
                    <span class="badge badge-secondary mr-1 p-1" *ngFor="let role of member.roles; let i = index">{{
                      role.name.toLowerCase()
                    }}</span>
                  </td>
                  <td>{{ member.role }}</td>
                  <td class="text-center" style="width: 52.5px" *ngIf="member.createBy === 'MANUAL'">
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      *ngIf="!(!this.isOwner && !(this.isDraft && this.isRequestor))"
                      (click)="onRemove(member.id)"
                    >
                      <i class="fa fa-times"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      *ngIf="!this.isOwner && !(this.isDraft && this.isRequestor)"
                      disabled
                    >
                      <i class="fa fa-times"></i>
                    </button>
                  </td>
                  <td *ngIf="member.createBy === 'SYSTEM'">-</td>
                </tr>
                <tr *ngIf="members.length === 0" class="text-center">
                  <td colspan="9">No Member</td>
                </tr>
              </tbody>
            </table>
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
export class MemberComponent extends BaseComponent implements OnInit, OnDestroy {
  members: Member[] = [];
  form: FormGroup;
  submit: boolean = false;
  ncrbno: string = '';
  filter = filterByName;
  isOwner: boolean = false;
  isDraft: boolean = false;
  isRequestor: boolean = false;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  public event: EventEmitter<string> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private auth: AuthService,
    private store: Store<IAppState>,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('member (modal)');

    this.form = this.fb.group({
      member: [null, Validators.required]
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      this.isOwner = this.request.isOwner;
      this.isDraft = this.request.isDraft;
      this.isRequestor = this.request.isRequestor;
      // If not `owner` and not `requestor` on `draft`
      if (!this.isOwner && !(this.isDraft && this.isRequestor)) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  async ngOnInit() {
    if (this.ncrbno) {
      try {
        const response: ResponseObj = await this.ajax.getMembers(this.ncrbno).toPromise();
        if (response.status === 200) {
          this.members = response.data;
          this.store.dispatch(setrequest(Object.assign({}, this.request, { members: this.members })));
        }
      } catch (ex) {
        // On Crashed
        console.error('Members (Initial) Errors: ', ex);
      }
    }
    if (!this.isOwner && !(this.isDraft && this.isRequestor)) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  async onAdd() {
    this.submit = true;
    if (this.form.valid) {
      try {
        const result = await alertConfirm('Make sure, your information before submit', 'Are you sure ?');
        if (result.value) {
          const fullname: string = this.form.getRawValue().member;
          const id: string = fullname.split('-')[0].trim();
          const idx: number = this.members.findIndex(obj => obj.empId === id);
          if (idx === -1) {
            const response = await this.ajax.saveMember(id, this.ncrbno, 'MANUAL').toPromise();
            if (response.data) {
              const member: Member = response.data;
              this.members.push({
                department: member.department || `${member.firstname} ${member.lastname[0]}.`,
                email: member.email,
                fullname: fullname,
                shortname: member.shortname,
                id: member.id,
                name: fullname,
                tel: member.tel,
                username: member.username,
                empId: member.empId,
                createBy: member.createBy
              });
              this.form.reset();
              this.submit = false;
            }
          } else {
            // Exit
            alertWarning(
              `
            <p>Please try again..</p>
            <span style="color: red; white-space: pre-line;">The member already existed.</span>
           `,
              'Warning!'
            );
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Members (Add) Errors: ', ex);
      }
    }
  }

  async onRemove(id: number) {
    const idx: number = this.members.findIndex(obj => obj.id === id);
    if (idx > -1) {
      try {
        const result = await alertConfirm('Make sure, your information before submit', 'Are you sure ?');
        if (result.value) {
          const response: ResponseObj = await this.ajax
            .removeMember(this.members[idx].id, this.user.username, this.request.ncnumber)
            .toPromise();
          if (response.status === 200) {
            this.members.splice(idx, 1);
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Members (Remove) Errors: ', ex);
      }
    }
  }
}
