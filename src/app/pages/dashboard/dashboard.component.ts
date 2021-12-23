import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BaseComponent } from '../../components';
import { DateConstant } from '../../constants';
import { Initial, Pagination, Parameter, ResponseObj, Summary } from '../../interfaces';
import { AjaxService, AuthService, DropdownService, LogService } from '../../services';
import { IAppState } from '../../store/store';

@Component({
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {
  isCollapsedOwners: boolean[] = [];
  // Doughnut
  public doughnutChartLabels: string[] = [];
  public doughnutChartData: number[] = [];
  public doughnutChartColors: any[] = [
    {
      backgroundColor: []
    }
  ];
  public doughnutChartType = 'pie';

  // Data
  public status: string = '';
  public color: string = '';
  public requests: Initial[] = [];
  public dateConstant: DateConstant = new DateConstant();

  loading: boolean = true;
  maintenance: boolean = false;

  public pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  public sortBy: string = 'NCRBID_DESC';

  private parameter: Parameter[] = [];
  private parameterSub: any = null;
  public filter: any = {
    search: '',
    startDate: moment().format('YYYY-01-01'),
    endDate: moment().format('YYYY-MM-DD'),
    mfg: '',
    ncrbNumber: '',
    assyCg: '',
    subMfg: ''
  };

  public _subMFG = [];
  private _rejectNames = [];
  private _materialTypes = [];
  constructor(
    private ajax: AjaxService,
    private router: Router,
    private auth: AuthService,
    private dropdown: DropdownService,
    private logService: LogService,
    private store: Store<IAppState>
  ) {
    // initial component
    super(logService);
    this.setPageName('dashboard');

    this.parameterSub = this.store.pipe(select('parameters')).subscribe((parameter: Parameter[]) => {
      this.parameter = parameter;
    });
  }

  async ngOnInit() {
    try {
      const reject = this.dropdown.getDropdownReject().toPromise();
      const material = this.dropdown.getDropdownMaterial().toPromise();
      const rejectRes = await reject;
      const materialRes = await material;
      if (rejectRes.status === 200) {
        const data = rejectRes.data.map(obj => {
          return { id: obj.id, label: obj.codeName, value: obj.id };
        });
        this._rejectNames = data;
      }
      if (materialRes.status === 200) {
        const data = materialRes.data.map(obj => {
          return { id: obj.id, label: obj.codeName, value: obj.id };
        });
        this._materialTypes = data;
      }

      // is maintenance
      const maintenance: boolean = await this.auth.isMaintenance();
      this.maintenance = maintenance;

      // doughnutChart
      let response: ResponseObj = await this.ajax.getSummary().toPromise();
      const summary: Summary = response.data;
      // When data are null
      summary.labels = summary.labels ? summary.labels : ['No data'];
      summary.values = summary.values ? summary.values : [1];
      summary.colors = summary.colors ? summary.colors : ['#bfd730'];
      // Configuration Chart (Doughnut)
      this.doughnutChartLabels = summary.labels;
      this.doughnutChartData = summary.values;
      this.doughnutChartColors[0].backgroundColor = summary.colors;
      this.status = this.doughnutChartLabels[0];
      this.color = this.doughnutChartColors[0].backgroundColor[0];
      if (this.status) {
        // response = await this.ajax.getFirstRequest().toPromise();
        // if (response.status === 200) {
        //   if (response.data.info) {
        //     this.filter.startDate = moment(new Date(response.data.info.date)).format('YYYY-MM-DD');
        //   }
        // }
        const orderBy: string = this.sortBy.split('_')[0];
        const orderFrom: string = this.sortBy.split('_')[1];
        response = await this.ajax
          .getRequestsByStatus(
            this.status,
            this.pagination.page,
            this.pagination.pageLength,
            orderBy,
            orderFrom,
            this.filter.startDate,
            this.filter.endDate,
            this.filter.ncrbNumber,
            this.filter.mfg,
            this.filter.subMfg,
            this.filter.assyCg
          )
          .toPromise();
        this.requests = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
        for (let i = 0; i < this.requests.length; i++) {
          this.isCollapsedOwners.push(true);
        }
      }
    } catch (ex) {
      // On Crashed
      console.error('Dashboard (Summary) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.loading = true;
    this.parameterSub.unsubscribe();
  }

  public detail(id: number): void {
    this.router.navigate([`requests/detail/${id}`], {
      queryParams: {
        by: 'dashboard'
      }
    });
  }

  // events
  public async chartClicked(e: any) {
    if (e && e.active && e.active.length > 0) {
      try {
        this.loading = true;
        const orderBy: string = this.sortBy.split('_')[0];
        const orderFrom: string = this.sortBy.split('_')[1];
        this.status = this.doughnutChartLabels[e.active[0]._index];
        this.color = this.doughnutChartColors[0].backgroundColor[e.active[0]._index];
        if (this.status) {
          const response = await this.ajax
            .getRequestsByStatus(
              this.status,
              this.pagination.page,
              this.pagination.pageLength,
              orderBy,
              orderFrom,
              this.filter.startDate,
              this.filter.endDate,
              this.filter.ncrbNumber,
              this.filter.mfg,
              this.filter.subMfg,
              this.filter.assyCg
            )
            .toPromise();
          this.requests = response.data.data;
          this.pagination = Object.assign({}, this.pagination, response.data.pagination);
          this.isCollapsedOwners = [];
          for (let i = 0; i < this.requests.length; i++) {
            this.isCollapsedOwners.push(true);
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Dashboard (Chart Click) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 50);
      }
    }
  }

  public async onSearching(evt?) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      if (evt) {
        this.filter = evt;
      }
      if (this.status) {
        const response = await this.ajax
          .getRequestsByStatus(
            this.status,
            this.pagination.page,
            this.pagination.pageLength,
            orderBy,
            orderFrom,
            this.filter.startDate,
            this.filter.endDate,
            this.filter.ncrbNumber,
            this.filter.mfg,
            this.filter.subMfg,
            this.filter.assyCg
          )
          .toPromise();
        this.requests = response.data.data;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
        this.isCollapsedOwners = [];
        for (let i = 0; i < this.requests.length; i++) {
          this.isCollapsedOwners.push(true);
        }
      }
    } catch (ex) {
      // On Crashed
      console.error('Dashboard (Searching) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  public async onPageChanged(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      console.log(this.pagination);
      const response: ResponseObj = await this.ajax
        .getRequestsByStatus(
          this.status,
          event.page,
          this.pagination.pageLength,
          orderBy,
          orderFrom,
          this.filter.startDate,
          this.filter.endDate,
          this.filter.ncrbNumber,
          this.filter.mfg,
          this.filter.subMfg,
          this.filter.assyCg
        )
        .toPromise();
      if (response.status === 200) {
        this.requests = response.data.data;
        this.pagination.page = event.page;
      }
      this.isCollapsedOwners = [];
      for (let i = 0; i < this.requests.length; i++) {
        this.isCollapsedOwners.push(true);
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

  public chartHovered(e: any): void {}

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

  public get titleGraph(): string {
    const idx: number = this.parameter.findIndex(o => o.label === 'TITLE_DASHBOARD_GRAPH');
    if (idx > -1) {
      return this.parameter[idx].value;
    }
    return 'loading...';
  }

  public get titleList(): string {
    const idx: number = this.parameter.findIndex(o => o.label === 'TITLE_DASHBOARD_LIST');
    if (idx > -1) {
      return this.parameter[idx].value;
    }
    return 'loading...';
  }
}
