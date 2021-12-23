import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';
import { BaseComponent, NxpSelection } from '../../components';
import { DateConstant, Status } from '../../constants';
import { Pagination, Parameter, ResponseObj, Score, User } from '../../interfaces';
import { AjaxService, DropdownService, LogService, MockService } from '../../services';
import { IAppState } from '../../store/store';
import { alertConfirm, dateTimeToDate } from '../../utils';

@Component({
  selector: 'app-request-my-owner-nc',
  templateUrl: './request-my-owner-nc.component.html'
})
export class RequestMyOwnerComponent extends BaseComponent implements OnInit, OnDestroy {
  items: Score[] = [];
  dateConstant: DateConstant = new DateConstant();
  dateConvert = dateTimeToDate;
  status = new Status();
  problemTypes: NxpSelection[] = [];
  loading: boolean = true;
  parameter: Parameter[] = [];
  parameterSub: any = null;
  user: User = null;
  userSub: any = null;
  sortBy: string = 'NCRBID_DESC';
  startDate: Date = null;
  endDate: Date = null;
  isCollapsedOwners: boolean[] = [];
  pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  date: Date = new Date();
  public searching: string = '';
  public filter: any = {
    startDate: moment().format('YYYY-01-01'),
    endDate: moment().format('YYYY-MM-DD'),
    assyCg: '',
    failureCode: '',
    faCode: '',
    mfg: '',
    ncrbNumber: '',
    status: '',
    subMfg: '',
    lotId: '',
    productDescription: ''
  };
  public _mfgs = [];
  public _subMFG = [];
  private _rejectNames = [];
  private _materialTypes = [];
  constructor(
    private store: Store<IAppState>,
    private mock: MockService,
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private router: Router,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('requests/mylists/owner');

    this.userSub = this.store.pipe(select('user')).subscribe(async (user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
        this.user = user;
        await this.onLoading();
      } else {
        this.user = null;
      }
    });
    this.parameterSub = this.store.pipe(select('parameters')).subscribe((parameter: Parameter[]) => {
      this.parameter = parameter;
    });
  }

  async ngOnInit() {
    if (this.user) {
      // await this.dropdown.getDropdowns().toPromise();
      const mfg = this.dropdown.getDropdownByGroup('MFG').toPromise();
      const subMFG = this.dropdown.getDropdownByGroup('AREA').toPromise();
      const reject = this.dropdown.getDropdownReject().toPromise();
      const material = this.dropdown.getDropdownMaterial().toPromise();
      const mfgRes = await mfg;
      const subMFGRes = await subMFG;
      const rejectRes = await reject;
      const materialRes = await material;
      if (mfgRes.status === 200) {
        mfgRes.data.map(obj => {
          if (this._mfgs.findIndex(o => o.label === obj.label) === -1) {
            this._mfgs.push({ id: parseInt(obj.value, 10), label: obj.label, value: obj.value });
          }
          return obj;
        });
        this._mfgs.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }
      if (subMFGRes.status === 200) {
        subMFGRes.data.map(obj => {
          if (this._subMFG.findIndex(o => o.label === obj.label) === -1) {
            this._subMFG.push({ id: parseInt(obj.value, 10), label: obj.label, value: obj.value });
          }
          return obj;
        });
        this._subMFG.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }
      if (rejectRes.status === 200) {
        const data = rejectRes.data.map(obj => {
          return { id: parseInt(obj.id, 10), label: obj.codeName, value: obj.id };
        });
        this._rejectNames = data;
      }
      if (materialRes.status === 200) {
        const data = materialRes.data.map(obj => {
          return { id: parseInt(obj.id, 10), label: obj.codeName, value: obj.id };
        });
        this._materialTypes = data;
      }
      await this.onLoading();
    }
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.parameterSub.unsubscribe();
  }

  async onLoading() {
    try {
      // let response: ResponseObj = await this.ajax.getFirstRequest().toPromise();
      // if (response.status === 200) {
      //   if (response.data.info) {
      //     this.filter.startDate = moment(new Date(response.data.info.date)).format('YYYY-MM-DD');
      //   }
      // }
      let response: ResponseObj = await this.ajax
        .getRequestsByUserLoginByCriteria(
          this.user.username,
          this.pagination.page,
          this.pagination.pageLength,
          this.sortBy.split('_')[0],
          this.sortBy.split('_')[1],
          this.filter.startDate,
          this.filter.endDate,
          this.filter,
          this.filter.subMfg,
          'owner'
        )
        .toPromise();
      // let response: ResponseObj = await this.ajax.getRequestsByUserLogin(this.user.username).toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        for (let i = 0; i < this.items.length; i++) {
          this.isCollapsedOwners.push(true);
        }
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
        response = await this.dropdown.getDropdownByGroup('PROBLEM').toPromise();
        this.problemTypes = response.data;
      }
    } catch (ex) {
      // On Crashed
      console.error('Request My (Loading My Requests) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  detail(id: number): void {
    this.router.navigate([`requests/detail/${id}`], {
      queryParams: {
        by: 'mylists'
      }
    });
  }

  getStatus(status: string): string {
    return this.status.getStatusTxt(status);
  }

  getProblem(problemType: string): string {
    return (
      this.problemTypes.length > 0 && this.problemTypes.find(obj => obj.id.toString() === problemType.toString())?.label
    );
  }

  getMfg(mfg: string): string {
    return this._mfgs.length > 0 && this._mfgs.find(obj => obj.id.toString() === mfg.toString())?.label;
  }

  async onSortByChange(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      const response: ResponseObj = await this.ajax
        .getRequestsByUserLoginByCriteria(
          this.user.username,
          this.pagination.page,
          this.pagination.pageLength,
          orderBy,
          orderFrom,
          this.filter.startDate,
          this.filter.endDate,
          this.filter,
          this.filter.subMfg,
          'owner'
        )
        .toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
      }
    } catch (ex) {
      // On Crashed
      console.error('Request My (Sorting My Requests) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  async onPageChanged(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      const response: ResponseObj = await this.ajax
        .getRequestsByUserLoginByCriteria(
          this.user.username,
          event.page,
          this.pagination.pageLength,
          orderBy,
          orderFrom,
          this.filter.startDate,
          this.filter.endDate,
          this.filter,
          this.filter.subMfg,
          'owner'
        )
        .toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        this.pagination.page = event.page;
      }
    } catch (ex) {
      // On Crashed
      console.error('Request My (Change Page My Requests) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  public async onSearching(searchin: any) {
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
      const response: ResponseObj = await this.ajax
        .getRequestsByUserLoginByCriteria(
          this.user.username,
          this.pagination.page,
          this.pagination.pageLength,
          orderBy,
          orderFrom,
          this.filter.startDate,
          this.filter.endDate,
          this.filter,
          this.filter.subMfg,
          'owner'
        )
        .toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  delete(id: number, ncnumber: string): void {
    alertConfirm().then(async result => {
      if (result.value) {
        const response = await this.ajax.deleteRequest(id, ncnumber).toPromise();
        if (response.status === 200) {
          const idx = this.items.findIndex(item => item.info.id === id);
          if (idx > -1) {
            this.items.splice(idx, 1);
            this.onSearching('');
          }
        }
      }
    });
  }

  getStartDate(): string {
    const startDate: Date = this.startDate;
    return startDate ? moment(startDate).format('YYYY-MM-DD') : null;
  }

  getEndDate(): string {
    const endDate: Date = this.endDate;
    return endDate ? moment(endDate).format('YYYY-MM-DD') : null;
  }

  subMfg(mfg: string, subM: string) {
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    const mfgObj = dropdowns.find(o => o.groupName === 'MFG' && parseInt(o.value, 10) === parseInt(mfg, 10)) || null;
    const idx = mfgObj
      ? dropdowns.findIndex(
          o =>
            o.groupName === 'AREA' &&
            parseInt(o.value, 10) === parseInt(subM, 10) &&
            parseInt(o.parentId, 10) === parseInt(mfgObj.id, 10)
        )
      : -1;
    let label = '';
    if (idx > -1) {
      label = dropdowns[idx].label;
    }

    return label;
  }

  rejectName(rejectN: number) {
    const idx = this._rejectNames.findIndex(o => o.id === rejectN);
    let label = '';
    if (idx > -1) {
      label = this._rejectNames[idx].label;
    }
    return label;
  }

  materialType(materialT: number) {
    const idx = this._materialTypes.findIndex(o => o.id === materialT);
    let label = '';
    if (idx > -1) {
      label = this._materialTypes[idx].label;
    }
    return label;
  }

  get isDev(): boolean {
    return this.user?.roles?.filter(role => role === 'DEV').length > 0;
  }

  public get title(): string {
    const idx: number = this.parameter.findIndex(o => o.label === 'TITLE_MY_OWNER_NC_LIST');
    if (idx > -1) {
      return this.parameter[idx].value;
    }
    return 'loading...';
  }

  public opening(ncrbId: number): void {
    window.open(`${environment.hostUrl}/requests/detail/${ncrbId}`);
  }
}
