import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { Pagination, ResponseObj, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService, RoleService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess } from '../../../utils';
import { ManagerRoleModalComponent } from './manager-role-modal.component';
import { ManagerRoleUserModalComponent } from './manager-role-user-modal.component';

@Component({
  selector: 'app-manager-role',
  templateUrl: './manager-role.component.html'
})
export class ManagerRoleComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  roles: any[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  searching: string = '';
  sortBy: string = 'ID_DESC';
  startDate: Date = null;
  endDate: Date = null;
  pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  categories: any[] = [];
  users: User[] = [];
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private roleService: RoleService,
    private logService: LogService,
    private store: Store<IAppState>
  ) {
    // initial component
    super(logService);
    this.setPageName('management/role-management');

    this.form = this.fb.group({
      name: ['', Validators.required],
      label: ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      const response: ResponseObj = await this.roleService
        .getRoles(
          this.pagination.page,
          this.pagination.pageLength,
          this.sortBy.split('_')[0],
          this.sortBy.split('_')[1],
          null,
          null,
          this.searching
        )
        .toPromise();
      if (response.status === 200) {
        this.roles = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
      }
    } catch (ex) {
      // On Crashed
      console.error('Manage Roles (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  public async onViewUsers(idx: number) {
    try {
      const response: ResponseObj = await this.ajax.getUsersByRoleName(this.roles[idx].id).toPromise();
      if (response.status === 200) {
        this.users = response.data;
        this.bsModalRef = this.modalService.show(ManagerRoleUserModalComponent, {
          ignoreBackdropClick: true,
          class: 'modal-lg modal-dialog-centered',
          initialState: {
            data: Object.assign({}, this.roles[idx], { rid: this.roles[idx].id, users: this.users }),
            categories: this.categories
          }
        });
        this.bsModalRef.content.event.subscribe(async (data: any) => {
          // updating
          try {
            const users: User = data.users.map(user => {
              return user.name;
            });
            const res = await this.ajax
              .updateRole(this.roles[idx].id, { add: users, roleName: this.roles[idx].name })
              .toPromise();
            await alertSuccess();
          } catch (err) {
            console.error('Updating Role name: ', err);
          } finally {
            setTimeout(() => {
              this.loading = false;
            }, 50);
          }
        });
      }
    } catch (ex) {
      console.error('Error on get users view: ', ex);
    }
  }

  public onChange(evt) {
    // Do Something
  }

  public onSubmit() {
    // On Submit
  }

  public onReset() {
    // On Reset
  }

  // public async onSubmit() {
  //   // validate
  //   this.submit = true;

  //   if (this.form.valid) {
  //     const result = await alertConfirm();
  //     if (result.value) {
  //       // creating
  //       try {
  //         console.log('Results: ', this.form.getRawValue());
  //         const response = await this.roleService.saveRejectName(this.form.getRawValue()).toPromise();
  //         if (response.status === 200) {
  //           if (await alertSuccess()) {
  //             this.onSearching();
  //           }
  //         }
  //       } catch (err) {
  //         console.error('Creating Reject name: ', err);
  //       } finally {
  //         this.submit = false;
  //         this.form.reset();
  //       }
  //     }
  //   }
  // }

  // public async onReset() {
  //   const result = await alertConfirm();
  //   if (result.value) {
  //     this.form.reset();
  //   }
  // }

  public onEdit(idx: number) {
    this.bsModalRef = this.modalService.show(ManagerRoleModalComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        data: Object.assign({}, this.roles[idx], { rid: this.roles[idx].id }),
        categories: this.categories
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      // updating
      try {
      } catch (err) {
        console.error('Updating Role name: ', err);
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 50);
      }
    });
  }

  public async onDelete(id: string) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        // TODO
        const response = await this.roleService.deleteRole(id).toPromise();
        if (response.status === 200) {
          const res = await alertSuccess();
          if (res) {
            this.onSearching();
          }
        }
      }
    } catch (ex) {
      console.error('On Delete', ex);
    } finally {
      // TODO
    }
  }

  public async onSearching() {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      this.pagination = Object.assign({}, this.pagination, {
        page: 1,
        pageLength: 10,
        total: 0,
        totalPage: 0
      });
      const response: ResponseObj = await this.roleService
        .getRoles(this.pagination.page, this.pagination.pageLength, orderBy, orderFrom, null, null, this.searching)
        .toPromise();
      if (response.status === 200) {
        this.roles = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  async onPageChanged(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      const response: ResponseObj = await this.roleService
        .getRoles(event.page, this.pagination.pageLength, orderBy, orderFrom, null, null, this.searching)
        .toPromise();
      if (response.status === 200) {
        this.roles = response.data.data;
        this.pagination.page = event.page;
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }
}
