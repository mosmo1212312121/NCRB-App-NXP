import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { ResponseObj, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService } from '../../../services';
import { alertConfirm } from '../../../utils';
import { AddUserGroupComponent } from './add-user-group/add-user-group.component';
import { EditUserGroupComponent } from './edit-user-group/edit-user-group.component';

@Component({
  selector: 'app-manager-user-group',
  templateUrl: './manager-user-group.component.html'
})
export class ManagerUserGroupComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  usersGroups: User[] = [];
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/user-group-management');
  }

  async ngOnInit() {
    try {
      const response: ResponseObj = await this.ajax.getUsersGroups().toPromise();
      if (response.status === 200) {
        this.usersGroups = response.data;
      }
    } catch (ex) {
      // On Crashed
      console.error('Manager User Group (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  addUserGroup() {
    this.bsModalRef = this.modalService.show(AddUserGroupComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {}
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      try {
        this.loading = true;
        const response: ResponseObj = await this.ajax.createUserGroup(data).toPromise();
        if (response.status === 200) {
          this.usersGroups.push(response.data);
        }
      } catch (ex) {
        console.error('Manager User Group (Add) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  editUserGroup(idx: number) {
    this.bsModalRef = this.modalService.show(EditUserGroupComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        data: this.usersGroups[idx]
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      try {
        this.loading = true;
        const response: ResponseObj = await this.ajax.updateUserGroup(data).toPromise();
        if (response.status === 200) {
          this.usersGroups[idx] = response.data;
        }
      } catch (ex) {
        console.error('Manager User Group (Update) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  async deleteUserGroup(idx: number) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        this.loading = true;
        const response: ResponseObj = await this.ajax.deleteUserGroup(this.usersGroups[idx].id).toPromise();
        if (response.status === 200) {
          this.usersGroups.splice(idx, 1);
        }
      }
    } catch (ex) {
      console.error('Manager User Group (Delete) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }
}
