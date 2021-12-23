import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertSuccess, filterByName } from '../../../utils';
import { AdminUserModalComponent } from './modal/admin-user-modal.component';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user-manage.component.html'
})
export class AdminUserManageComponent extends BaseComponent implements OnInit, OnDestroy {
  users: User[] = [];
  bsModalRef: BsModalRef;
  user: User = null;
  userSub: any = null;
  form: FormGroup;
  loading: boolean = false;
  public filterByName = filterByName;
  public submit: boolean = false;
  constructor(
    private ajax: AjaxService,
    private modalService: BsModalService,
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('admin/user-management');

    this.form = this.fb.group({
      user: []
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
    });
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const response: ResponseObj = await this.ajax.getUsersAndRoles().toPromise();
      if (response.status === 200) {
        this.users = response.data;
        // this.users = this.users.filter(obj => obj.roles.findIndex(o => o === 'ADMIN') > -1);
        if (this.user?.empId !== 'empId') {
          // this.users = this.users.filter(obj => obj.empId !== this.user.empId);
        }
      }
    } catch (ex) {
      console.error('User Management (Initial) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  async onEdit(id: number) {
    try {
      const response: ResponseObj = await this.ajax.getUserAndRoles(id).toPromise();
      this.bsModalRef = this.modalService.show(AdminUserModalComponent, {
        ignoreBackdropClick: true,
        class: 'modal-lg modal-dialog-centered',
        initialState: {
          data: response.data,
          isDev: this.isDev(this.user)
        }
      });
      this.bsModalRef.content.event.subscribe(async (data: any) => {
        const roles = {
          add: [],
          remove: []
        };
        this.users = this.users.map(obj => {
          if (obj.id === id) {
            for (let i = 0; i < data.roles.length; i++) {
              // find new roles
              const idx: number = obj.roles.findIndex(ob => ob === data.roles[i]);
              if (idx === -1) {
                roles.add.push(data.roles[i]);
                obj.roles.push(data.roles[i]);
              }
            }

            for (let i = 0; i < obj.roles.length; i++) {
              // remove roles
              const idx: number = data.roles.findIndex(ob => ob === obj.roles[i]);
              if (idx === -1) {
                roles.remove.push(obj.roles[i]);
                obj.roles.splice(i, 1);
              }
            }

            obj = data;
          }
          return obj;
        });

        try {
          const res: ResponseObj = await this.ajax.getUpdateRole(id, roles).toPromise();
          if (res.status === 200) {
            console.log('Current ID: ', this.users.find(o => o.empId === this.user.empId).id);
            console.log('Edit ID: ', id);
            if (this.users.find(o => o.empId === this.user.empId).id === id) {
              const result = await alertSuccess();
              if (result) {
                localStorage.clear();
                window.location.reload();
              }
            } else {
              const result = await alertSuccess();
              if (result) {
                // updated other people roles
              }
            }
          }
        } catch (ex) {
          console.error('User Management (Update Role) Errors: ', ex);
        }
      });
    } catch (ex) {
      console.error('User Management (Get Information) Errors: ', ex);
    }
  }

  onRemove(empId: string): void {}

  onChange(evt): void {
    const empId: string = this.form
      .get('user')
      .value.split('-')[0]
      .trim();
    if (empId) {
      this.loading = true;
      this.ajax.getFindUser(empId).subscribe(
        response => {
          // On Success
          if (response.status === 200) {
            this.onEdit(response.data.id);
          }
        },
        error => {
          // On Error
          console.error(error);
        },
        () => {
          // On Finally
          this.loading = false;
        }
      );
    }
  }

  isAdmin(user: User): boolean {
    return user.roles.findIndex(obj => obj === 'ADMIN') > -1;
  }

  isDev(user: User): boolean {
    return user.roles.findIndex(obj => obj === 'DEV') > -1;
  }
}
