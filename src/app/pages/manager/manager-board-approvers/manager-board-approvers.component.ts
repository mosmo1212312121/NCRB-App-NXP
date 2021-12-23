import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { Pagination, ResponseObj } from '../../../interfaces';
import { AjaxService, BoardGroupService, DropdownService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertError, alertSuccess } from '../../../utils';

@Component({
  selector: 'app-manager-board-approvers',
  templateUrl: './manager-board-approvers.component.html'
})
export class ManagerBoardApproversComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  members: FormArray;
  _mfgs: NxpSelection[] = [];
  _subMfgs: NxpSelection[] = [];
  _groupNames: string[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  searching: string = '';
  sortBy: string = 'GROUP_ID-DESC';
  startDate: Date = null;
  endDate: Date = null;
  pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  public boardGroups: any[] = [];
  public boardGroupsMaster: any[] = [];
  private membersRemove: string[] = [];
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private boardGroupService: BoardGroupService,
    private logService: LogService,
    private store: Store<IAppState>
  ) {
    // initial component
    super(logService);
    this.setPageName('management/board-approver-management');
    // Initial Form
    this.onCancel();
  }

  async ngOnInit() {
    try {
      // await this.dropdown.getDropdowns().toPromise();
      const mfg = this.dropdown.getDropdownByGroup('MFG').toPromise();
      const boardGroupsMaster = this.boardGroupService.getBoardGroupMasterAll().toPromise();
      const promises = await Promise.all([mfg, boardGroupsMaster]);

      // Using
      this._mfgs = promises[0].data;
      this.boardGroupsMaster = promises[1].data.map(o => ({
        ...o,
        ...{ id: o.groupMasterId, label: o.groupName, value: o.groupMasterId }
      }));

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

  public async onMasterChange(evt) {
    const { master, groupName } = this.form.getRawValue();
    const idx: number = this.boardGroupsMaster.findIndex(o => o.id === master);
    this.form.patchValue({
      groupName: groupName ? groupName : this.boardGroupsMaster[idx].groupName,
      needDevice: this.boardGroupsMaster[idx].needDevice,
      needQrb: this.boardGroupsMaster[idx].needQrb,
      needMrb: this.boardGroupsMaster[idx].needMrb
    });
  }

  public async onMfgChange(evt) {
    const { mfg } = this.form.getRawValue();
    const _mfg = this._mfgs.find(o => o.value.toString() === mfg.toString());
    if (_mfg) {
      const response = await this.dropdown.getDropdown(_mfg.id.toString(), 'AREA').toPromise();
      this._subMfgs = response.data;
      this.form.get('subMfg').patchValue('');
    }
  }

  public async onSubMfgChange(evt) {
    const { mfg, subMfg } = this.form.getRawValue();
    // Get Something on role and action
    this._groupNames = (await this.boardGroupService.getBoardGroupBySubMfg(mfg, subMfg).toPromise()).data.map(
      usr => usr.groupName
    );
    if (this.form.get('groupId').value === 0) {
      this.form.get('groupName').setValidators([this.DuplicateValidator(this._groupNames)]);
      this.form.get('groupName').updateValueAndValidity();
    }
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

  public async onEdit(idx: number) {
    this.members = this.form.get('members') as FormArray;
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    const _mfg = this._mfgs.find(_o => _o.value.toString() === this.boardGroups[idx].mfg.toString());
    if (_mfg) {
      this.loading = true;
      const result = dropdowns.filter(o => o.groupName === 'AREA' && o.parentId === _mfg.id);
      this._subMfgs = result;
      setTimeout(async () => {
        try {
          this.form.patchValue(this.boardGroups[idx]);
          this.clearFormArray(this.members);
          if (this.boardGroups[idx].members.length > 0) {
            for (let i = 0; i < this.boardGroups[idx].members.length; i++) {
              const member = this.boardGroups[idx].members[i];
              this.members.push(
                this.fb.group({
                  ...member,
                  ...{
                    name: [{ value: member.memberName, disabled: true }],
                    username: member.memberWBI
                  }
                })
              );
            }
          } else {
            this.addMember();
          }
          await this.onSubMfgChange(null);
          document.getElementById('topView').scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
          console.log(err);
        } finally {
          this.loading = false;
        }
      }, 500);
    }
  }

  public async onSubmit() {
    // On Submit
    this.submit = true;
    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        try {
          const response = await this.boardGroupService.saveBoardGroup(this.form.getRawValue()).toPromise();
          if (response.status === 200) {
            await this.onSaveMembers(response.data.groupId);
            await this.onSearching();
            await alertSuccess();
            this.onCancel();
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
          const response = await this.boardGroupService.updateBoardGroup(data.groupId, data).toPromise();
          if (response.status === 200) {
            await this.onSaveMembers(data.groupId);
            await this.onSearching();
            await alertSuccess();
            this.onCancel();
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
      groupId: [0],
      master: [''],
      mfg: ['', Validators.required],
      subMfg: ['', Validators.required],
      groupName: ['', Validators.required],
      needDevice: [false],
      needQrb: [false],
      needMrb: [false],
      members: this.fb.array([])
    });
    this.members = this.form.get('members') as FormArray;
    this.addMember();
  }

  public async onSaveMembers(groupId) {
    const members = this.members.getRawValue();
    const membersRemove = this.membersRemove;
    const saveMembers = [];
    const removeMembers = [];
    for (let i = 0; i < members.length; i++) {
      if (members[i].memberId === 0) {
        saveMembers.push(
          this.boardGroupService
            .saveBoardMember({
              memberId: members[i].memberId,
              groupId: groupId,
              memberName: members[i].name,
              memberWBI: members[i].username
            })
            .toPromise()
        );
      }
    }
    for (let i = 0; i < membersRemove.length; i++) {
      removeMembers.push(this.boardGroupService.deleteBoardMember(membersRemove[i]).toPromise());
    }
    await Promise.all(saveMembers);
    await Promise.all(removeMembers);
  }

  public onMemberChange(idx: number) {
    const members = JSON.parse(localStorage.getItem('users'));
    this.members = this.form.get('members') as FormArray;
    const { name } = (this.members.at(idx) as FormGroup).getRawValue();
    if (name) {
      const empId = name.split('-')[0].trim();
      const usersFiltered = members.filter(usr => usr.empId === empId);
      this.members.at(idx).patchValue({
        empId: usersFiltered[0].empId,
        username: usersFiltered[0].username
      });
    }
  }

  public addMember() {
    this.members = this.form.get('members') as FormArray;
    this.members.push(
      this.fb.group({
        memberId: [0],
        groupId: [0],
        empId: ['', Validators.required],
        username: ['', Validators.required],
        name: ['', Validators.required]
      })
    );
  }

  public delMember(idx: number) {
    this.members = this.form.get('members') as FormArray;
    const { groupId, memberId } = (this.members.at(idx) as FormGroup).getRawValue();
    if (groupId > 0) {
      this.membersRemove.push(memberId);
    }
    this.members.removeAt(idx);
  }

  public async onDelete(id: string) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        // TODO
        const response = await this.boardGroupService.deleteBoardGroup(id).toPromise();
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
        .getBoardGroups(
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
        this.boardGroups = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  async onUploadBoardMember(event) {
    try {
      const formData = new FormData();
      formData.append('file', event.target.files[0], `/MEMBER/${event.target.files[0].name}`);
      let response: ResponseObj = await this.ajax.uploadBoardMember(formData).toPromise();

      if (response.status === 200) {
        response = await this.ajax.uploadBoardMembers(response.data).toPromise();
      } else {
        alertError(response.statusText);
      }
    } catch (ex) {}
  }

  async onPageChanged(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('-')[0];
      const orderFrom: string = this.sortBy.split('-')[1];
      const response: ResponseObj = await this.boardGroupService
        .getBoardGroups(event.page, this.pagination.pageLength, orderBy, orderFrom, null, null, this.searching)
        .toPromise();
      if (response.status === 200) {
        this.boardGroups = response.data.data;
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
    const { mfg, subMfg, groupName, members } = this.form.getRawValue();
    let allUserCollected = members.length > 0;
    for (let i = 0; i < members.length; i++) {
      if (!members[i].username) {
        allUserCollected = false;
      }
    }
    return mfg && subMfg && groupName && allUserCollected;
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  public get isDevOrTest(): boolean {
    return false;
  }
}
