import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../../components';
import { IA, ResponseObj, User } from '../../../../interfaces';
import { AjaxService, LogService } from '../../../../services';
import { alertConfirm, filterByName } from '../../../../utils';

@Component({
  selector: 'app-add-user',
  templateUrl: 'admin-user-modal.component.html'
})
export class AdminUserModalComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  data: User = null;
  ackDate: any = null;
  submit: boolean = false;
  filter = filterByName;
  roles: FormArray;
  isDev: boolean = false;
  public event: EventEmitter<IA> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('admin/user-management/(modal)');

    this.form = this.fb.group({
      id: [null],
      username: [null, Validators.required],
      name: [null, Validators.required],
      empId: [null, Validators.required],
      email: [null, Validators.required],
      roles: this.fb.array([])
    });
    this.roles = this.form.get('roles') as FormArray;
  }

  async ngOnInit() {
    try {
      if (this.data) {
        this.form.patchValue(this.data);
        this.logging(`editing data user named: <b>${this.data.name}</b>`);
      }
      const response: ResponseObj = await this.ajax.getRoles().toPromise();
      if (response.status === 200) {
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].label !== 'DEV' || this.isDev) {
            this.roles.push(
              this.fb.group({
                id: response.data[i].id,
                name: response.data[i].name,
                label: response.data[i].label,
                selected: this.data.roles.findIndex(obj => obj === response.data[i].name) > -1
              })
            );
          }
        }
      }
    } catch (ex) {
      console.error('User Management (Modal) Errors: ', ex);
      this.logging(`editing data user named: <b>${this.data.name}</b> failed <br/>
        <pre>${JSON.stringify(ex)}</pre>`);
    }
  }

  onSave(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const data = this.form.getRawValue();
          data.roles = data.roles.filter(obj => obj.selected);
          data.roles = data.roles.map(obj => obj.name);
          this.logging(`edited user named: <b>${this.data.name}</b> completed`);
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
    this.logging(`cancel editing user named: <b>${this.data.name}</b>`);
  }
}
