import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { Pagination, ResponseObj } from '../../../interfaces';
import { DropdownService, LogService } from '../../../services';
import { AutoActionService } from '../../../services/auto-action.service';
import { RejectNameService } from '../../../services/reject-name.service';
import { RoleActionService } from '../../../services/role-action.service';
import { alertConfirm, alertSuccess } from '../../../utils';

const initAction = {
  id: 0,
  action: '',
  autoDispositionId: 0,
  isEdit: false,
  prority: false,
  roleActionId: ''
};

@Component({
  selector: 'app-manager-autoactions',
  templateUrl: './manager-autoactions.component.html',
  styles: ['./manager-autoactions.component.scss']
})
export class ManagerAutoactionsComponent extends BaseComponent implements OnInit {
  _dispositions: NxpSelection[] = [];
  _mfgs: NxpSelection[] = [];
  _subMfgs: NxpSelection[] = [];
  _rejectNames: NxpSelection[] = [];
  _rescreens: NxpSelection[] = [];
  _categories: NxpSelection[] = [];
  form: FormGroup;
  autoDispositions: any[] = [];
  rejectNames: any[] = [];
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
  action: any = initAction;
  actions: any[] = [];
  actionsTemp: any[] = [];
  public _roleActions: any[] = [];
  constructor(
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private rejectService: RejectNameService,
    private autoActionService: AutoActionService,
    private roleActionService: RoleActionService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/autoactions-management');

    this.form = this.fb.group({
      id: [0],
      mfg: ['', Validators.required],
      subMfg: ['', Validators.required],
      rejectName: ['', Validators.required],
      dispositionType: [0, Validators.required],
      rescreen1: [0],
      rescreen2: [0],
      rescreen3: [0]
    });
  }

  async ngOnInit() {
    try {
      // Declaration
      // await this.dropdown.getDropdowns().toPromise();
      const category = this.dropdown.getDropdownByGroup('CATEGORY').toPromise();
      const dispositions = this.dropdown.getDropdownByGroup('DISPOSITION').toPromise();
      const mfg = this.dropdown.getDropdownByGroup('MFG').toPromise();
      const rescreens = this.dropdown.getDropdownByGroup('RESCREEN').toPromise();
      const data = JSON.parse(localStorage.getItem('rejectNames')).map(o => {
        return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
      });
      this._rejectNames = data;

      // Using
      this._categories = (await category).data;
      this._dispositions = (await dispositions).data;
      this._mfgs = (await mfg).data;
      this._rescreens = (await rescreens).data;
      const response: ResponseObj = await this.autoActionService
        .getAutoDispositions(
          this.pagination.page,
          this.pagination.pageLength,
          this.sortBy.split('_')[0],
          this.sortBy.split('_')[1],
          null,
          null
        )
        .toPromise();
      if (response.status === 200) {
        this.autoDispositions = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
      }
    } catch (ex) {
      // On Crashed
      console.error('Manage Reject Names (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  public onChange(evt) {
    // Do Something
  }

  public onClear() {
    alertConfirm().then(result => {
      if (result.value) {
        window.location.reload();
      }
    });
  }

  public async onSave() {
    // validate
    this.submit = true;

    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        // creating
        try {
          const response = await this.autoActionService.saveAutoDisposition(this.form.getRawValue()).toPromise();
          if (response.status === 200 && response.data) {
            this.form.get('id').patchValue(response.data.id);
            await this.onSearching();
            await alertSuccess();
            await this.onEdit(0);
          }
        } catch (err) {
          console.error('Saving Auto Disposition: ', err);
        } finally {
          this.submit = false;
        }
      }
    }
  }

  public onDispositionChange(evt) {
    // Do Something
    // I will re-run
  }

  public onChangeRescreen1(evt) {
    // Do Something
    // I will re-run
  }

  public onChangeRescreen2(evt) {
    // Do Something
    // I will re-run
  }

  public onChangeRescreen3(evt) {
    // Do Something
    // I will re-run
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
    const { mfg, subMfg, rejectName } = this.form.getRawValue();

    const data = JSON.parse(localStorage.getItem('rejectNames'))
      .filter(o => o.mfg.toString() === mfg.toString() && o.subMfg.toString() === subMfg.toString())
      .map(o => {
        return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
      });
    this._rejectNames = data;

    if (rejectName && subMfg) {
      // Get Autoactions
      const response = await this.autoActionService.getAuto(mfg, subMfg, rejectName).toPromise();
      if (response.status === 200) {
        await this.getAutoActions(response);
      }
    }

    this.action = initAction;

    // Get Groupnames
    this._roleActions = (await this.roleActionService.getGroupNames(mfg, subMfg).toPromise()).data.map(ra => ({
      id: ra.raid,
      label: ra.groupName,
      users: ra.users
    }));
  }

  public async onRejectNameChange(evt) {
    const { mfg, subMfg, rejectName } = this.form.getRawValue();
    if (subMfg) {
      // Continue
      const response = await this.autoActionService.getAuto(mfg, subMfg, rejectName).toPromise();
      if (response.status === 200) {
        await this.getAutoActions(response);
      }
    }
  }

  public getUsers(roleActionId) {
    return this._roleActions.find(ra => parseInt(ra.id, 10) === parseInt(roleActionId, 10))?.users || [];
  }

  private async getAutoActions(response) {
    const { mfg, subMfg, rejectName } = this.form.getRawValue();
    this.form.patchValue(Object.assign({}, response.data, { mfg, subMfg, rejectName }));
    if (response.data.id === 0) {
      this.form.patchValue({ id: 0 });
    }
    const res = await this.autoActionService.getAutoAct(response.data.id).toPromise();
    if (res.status === 200) {
      this.actions = res.data.map(o => {
        return { ...o, ...{ isEdit: false } };
      });
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
      const response: ResponseObj = await this.autoActionService
        .getAutoDispositions(this.pagination.page, this.pagination.pageLength, orderBy, orderFrom, null, null)
        .toPromise();
      if (response.status === 200) {
        this.autoDispositions = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  public async onPageChanged(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      const response: ResponseObj = await this.autoActionService
        .getAutoDispositions(event.page, this.pagination.pageLength, orderBy, orderFrom, null, null)
        .toPromise();
      if (response.status === 200) {
        this.autoDispositions = response.data.data;
        this.pagination.page = event.page;
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  public async onEdit(idx: number) {
    this.loading = true;
    const response = await this.dropdown
      .getDropdown(
        this._mfgs.find(o => parseInt(o.value, 10) === parseInt(this.autoDispositions[idx].mfg, 10))?.id.toString() ||
          '0',
        'AREA'
      )
      .toPromise();
    this._subMfgs = response.data;
    this.form.patchValue(this.autoDispositions[idx]);
    this.form.updateValueAndValidity();
    setTimeout(async () => {
      this.form.get('subMfg').patchValue(this.autoDispositions[idx].subMfg);
      this.form.get('subMfg').updateValueAndValidity();
      await this.onSubMfgChange(null);
      document.getElementById('topView').scrollIntoView({ behavior: 'smooth' });
      this.loading = false;
    }, 1000);
  }

  public async onCreateAction() {
    this.action.submit = true;
    this.action.autoDispositionId = this.form.get('id').value;
    const { autoDispositionId, action, roleActionId } = this.action;
    if (autoDispositionId && action && roleActionId) {
      const result = await alertConfirm();
      if (result.value) {
        const response = await this.autoActionService.saveAct(this.action).toPromise();
        if (response.status === 200) {
          const { id } = this.form.getRawValue();
          this.actions = (await this.autoActionService.getAutoAct(id).toPromise()).data;
          this.action = { ...initAction, ...{ autoDispositionId: this.form.get('id').value } };
          await alertSuccess();
        }
        this.action.submit = false;
      }
    }
  }

  public async onSaveAction(idx: number) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        const response = await this.autoActionService.saveAct(this.actions[idx]).toPromise();
        if (response.status === 200) {
          const { id } = this.form.getRawValue();
          this.actions = (await this.autoActionService.getAutoAct(id).toPromise()).data;
          this.action = {
            id: 0,
            action: '',
            isEdit: false,
            autoDispositionId: this.form.get('id').value
          };
          await alertSuccess();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async onCancelAction(idx: number) {
    const { id } = this.form.getRawValue();
    this.actions[idx] = (await this.autoActionService.getAutoAct(id).toPromise()).data.map(o => {
      return { ...o, ...{ isEdit: false } };
    })[idx];
  }

  public onEditAction(idx: number) {
    this.actions[idx].isEdit = true;
  }

  public async onDeleteAction(idx: number) {
    const result = await alertConfirm();
    if (result.value) {
      const response = await this.autoActionService.deleteAutoAction(this.actions[idx].id).toPromise();
      if (response.data) {
        const { id } = this.form.getRawValue();
        this.actions = (await this.autoActionService.getAutoAct(id).toPromise()).data;
        await alertSuccess();
      }
    }
  }

  public category(c: string): string {
    let label = '-';
    const idx = this._categories.findIndex(o => parseInt(o.value, 10) === parseInt(c, 10));
    if (idx > -1) {
      label = this._categories[idx].label;
    }
    return label;
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

  public dispositionType(c: string): string {
    let label = '-';
    const idx = this._dispositions.findIndex(o => parseInt(o.value, 10) === parseInt(c, 10));
    if (idx > -1) {
      label = this._dispositions[idx].label;
    }
    return label;
  }

  public rejectName(c: string): string {
    let label = '-';
    const idx = this._rejectNames.findIndex(o => parseInt(o.value, 10) === parseInt(c, 10));
    if (idx > -1) {
      label = this._rejectNames[idx].label;
    }
    return label;
  }

  public rescreen(c: string): string {
    let label = '-';
    const idx = this._rescreens.findIndex(o => parseInt(o.value, 10) === parseInt(c, 10));
    if (idx > -1) {
      label = this._rescreens[idx].label;
    }
    return label;
  }

  public get canCreate() {
    const { mfg, subMfg, rejectName } = this.form.getRawValue();
    return mfg && subMfg && rejectName;
  }
}
