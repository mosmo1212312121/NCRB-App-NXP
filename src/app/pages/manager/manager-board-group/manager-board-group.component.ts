import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { Pagination, ResponseObj } from '../../../interfaces';
import { AjaxService, BoardGroupService, DropdownService, LogService } from '../../../services';
import { alertConfirm, alertSuccess } from '../../../utils';

@Component({
  selector: 'app-manager-board-group',
  templateUrl: './manager-board-group.component.html'
})
export class ManagerBoardGroupComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  users: FormArray;
  _mfgs: NxpSelection[] = [];
  _subMfgs: NxpSelection[] = [];
  _groupNames: string[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  searching: string = '';
  sortBy: string = 'GROUP_MASTER_ID-DESC';
  startDate: Date = null;
  endDate: Date = null;
  pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  public boardGroupMasters: any[] = [];
  private usersRemove: string[] = [];
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private boardGroupService: BoardGroupService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/board-group-management');
    // Initial Form
    this.onCancel();
  }

  async ngOnInit() {
    try {
      // await this.dropdown.getDropdowns().toPromise();
      const mfg = this.dropdown.getDropdownByGroup('MFG').toPromise();

      this.form = this.fb.group({
        groupMasterId: [0],
        groupName: ['', Validators.required],
        needDevice: [false],
        needQrb: [false],
        needMrb: [false]
      });

      // Using
      this._mfgs = (await mfg).data;

      await this.onSearching();
    } catch (ex) {
      // On Crashed
      console.error('Manage Roles (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  public async onMfgChange(evt) {
    const { mfg } = this.form.getRawValue();
    const response = await this.dropdown
      .getDropdown(this._mfgs.find(o => parseInt(o.value, 10) === parseInt(mfg, 10)).id.toString(), 'AREA')
      .toPromise();
    this._subMfgs = response.data;
    this.form.get('subMfg').patchValue('');
  }

  public async onSubMfgChange(evt) {
    const { mfg, subMfg } = this.form.getRawValue();
    // Get Something on role and action
    // this._groupNames = (await this.roleActionService.getGroupNames(mfg, subMfg).toPromise()).data.map(
    //   usr => usr.groupName
    // );
    // if (this.form.get('raid').value === 0) {
    //   this.form.get('groupName').setValidators([this.DuplicateValidator(this._groupNames)]);
    //   this.form.get('groupName').updateValueAndValidity();
    // }
  }

  public async onGroupNameChange(evt) {}

  private DuplicateValidator(items: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value !== undefined && isNaN(control.value)) {
        const idx: number = items.findIndex(o => o.toUpperCase() === control.value.toUpperCase());
        if (idx > -1) {
          return { duplicate: true };
        }
      }
      return null;
    };
  }

  public onViewUsers(idx: number) {}

  public onChange(evt) {
    // Do Something
  }

  // public async onEdit(idx: number) {
  //   this.users = this.form.get('users') as FormArray;
  //   const response = await this.dropdown
  //     .getDropdown(
  //       this._mfgs.find(o => parseInt(o.value, 10) === parseInt(this.boardGroupMasters[idx].mfg, 10))?.id.toString() || '0',
  //       'AREA'
  //     )
  //     .toPromise();
  //   this._subMfgs = response.data;
  //   setTimeout(async () => {
  //     this.form.patchValue(this.roleActions[idx]);
  //     this.clearFormArray(this.users);
  //     for (let i = 0; i < this.roleActions[idx].users.length; i++) {
  //       this.users.push(this.fb.group(this.roleActions[idx].users[i]));
  //     }
  //     await this.onSubMfgChange(null);
  //     document.getElementById('topView').scrollIntoView({ behavior: 'smooth' });
  //   }, 500);
  // }

  public async onSubmit() {
    // On Submit
    this.submit = true;
    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        try {
          const response = await this.boardGroupService.saveBoardGroupMaster(this.form.getRawValue()).toPromise();
          if (response.status === 200) {
            console.log(this.form.getRawValue());
            await this.onSearching();
            await alertSuccess();
          }
        } catch (err) {
          console.error(err);
        } finally {
          this.submit = false;
        }
      }
    }
  }

  public async onSave() {
    // On Submit
    this.submit = true;
    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        try {
          const data = this.form.getRawValue();
          const response = await this.boardGroupService.updateBoardGroupMaster(data.groupMasterId, data).toPromise();
          if (response.status === 200) {
            console.log(data);
            await this.onSearching();
            await alertSuccess();
          }
        } catch (err) {
          console.error(err);
        } finally {
          this.submit = false;
        }
      }
    }
  }

  public onCancel() {
    this.form = this.fb.group({
      groupMasterId: [0],
      groupName: ['', Validators.required],
      needDevice: [false],
      needQrb: [false],
      needMrb: [false]
    });
  }

  public async onDelete(id: string) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        // TODO
        const response = await this.boardGroupService.deleteBoardGroupMaster(id).toPromise();
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
      const orderBy: string = this.sortBy.split('-')[0];
      const orderFrom: string = this.sortBy.split('-')[1];
      this.pagination = Object.assign({}, this.pagination, {
        page: 1,
        pageLength: 10,
        total: 0,
        totalPage: 0
      });
      const response: ResponseObj = await this.boardGroupService
        .getBoardGroupMaster(
          this.pagination.page,
          this.pagination.pageLength,
          orderBy,
          orderFrom,
          null,
          null,
          this.searching
        )
        .toPromise();
      if (response.status === 200) {
        this.boardGroupMasters = response.data.data;
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
      const orderBy: string = this.sortBy.split('-')[0];
      const orderFrom: string = this.sortBy.split('-')[1];
      const response: ResponseObj = await this.boardGroupService
        .getBoardGroupMaster(event.page, this.pagination.pageLength, orderBy, orderFrom, null, null, this.searching)
        .toPromise();
      if (response.status === 200) {
        this.boardGroupMasters = response.data.data;
        this.pagination.page = event.page;
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  public mfg(c: string): string {
    let label = '-';
    const idx = this._mfgs.findIndex(o => parseInt(o.value, 10) === parseInt(c, 10));
    if (idx > -1) {
      label = this._mfgs[idx].label;
    }
    return label;
  }

  public subMfg(mfg: string, subMfg: string): string {
    let dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    dropdowns = dropdowns.filter(
      o =>
        o.groupName === 'AREA' && o.parentId === this._mfgs.find(_o => parseInt(_o.value, 10) === parseInt(mfg, 10)).id
    );
    let label = '-';
    const idx = dropdowns.findIndex(o => parseInt(o.value, 10) === parseInt(subMfg, 10));
    if (idx > -1) {
      label = dropdowns[idx].label;
    }
    return label;
  }

  public get canCreate(): boolean {
    const { groupName } = this.form.getRawValue();
    return groupName;
  }

  private clearForm() {
    this.form.reset();
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
}
