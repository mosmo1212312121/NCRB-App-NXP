import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { Pagination, ResponseObj } from '../../../interfaces';
import { AjaxService, DropdownService, LogService } from '../../../services';
import { RejectNameService } from '../../../services/reject-name.service';
import { alertConfirm, alertSuccess } from '../../../utils';
import { RejectCriteriaModalComponent } from './reject-criteria-modal.component';

@Component({
  selector: 'app-manager-reject-criteria',
  templateUrl: './manager-reject-criteria.component.html'
})
export class ManagerRejectCriteriaComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  categories: NxpSelection[] = [];
  faCodes: NxpSelection[] = [];
  holdCodes: NxpSelection[] = [];
  rejectNames: any[] = [];
  mfgs: NxpSelection[] = [];
  subMfgs: NxpSelection[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  searching: string = '';
  sortBy: string = 'RID_DESC';
  startDate: Date = null;
  endDate: Date = null;
  pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private rejectService: RejectNameService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/reject-criteria-management');

    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      category: ['', Validators.required],
      faCode: [0, Validators.required],
      spec: ['', Validators.required],
      levelVal: ['', Validators.required],
      holdCode: ['', Validators.required],
      holdComment: ['-'],
      mfg: ['', Validators.required],
      subMfg: ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      const results = await this.ajax.getPromiseAll([
        this.dropdown.getDropdownByGroup('CATEGORY').toPromise(),
        this.dropdown.getDropdownByGroup('FACODE').toPromise(),
        this.dropdown.getDropdownByGroup('HOLD').toPromise(),
        this.dropdown.getDropdownByGroup('MFG').toPromise()
      ]);
      this.categories = results[0].data;
      this.faCodes = results[1].data;
      this.holdCodes = results[2].data;
      this.mfgs = results[3].data;
      const response: ResponseObj = await this.rejectService
        .getRejectNames(
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
        this.rejectNames = response.data.data;
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

  public category(c: string): string {
    let label = '-';
    const idx = this.categories.findIndex(o => parseInt(o.value, 10) === parseInt(c, 10));
    if (idx > -1) {
      label = this.categories[idx].label;
    }
    return label;
  }

  public onChange(evt) {
    // Do Something
  }

  public async onMfgChange(evt) {
    // Do Something
    try {
      this.loading = true;
      const { mfg } = this.form.getRawValue();
      const idx: number = this.mfgs.findIndex(o => o.value === mfg);
      if (idx > -1) {
        const response = await this.dropdown.getDropdownByParent(this.mfgs[idx].id.toString()).toPromise();
        this.subMfgs = response.data;
      }
    } catch (err) {
      console.log('Error: ', err);
      this.subMfgs = [];
    } finally {
      this.loading = false;
    }
  }

  public async onSubmit() {
    // validate
    this.submit = true;

    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        // creating
        try {
          console.log('Results: ', this.form.getRawValue());
          const response = await this.rejectService.saveRejectName(this.form.getRawValue()).toPromise();
          if (response.status === 200) {
            if (await alertSuccess()) {
              this.onSearching();
            }
          }
        } catch (err) {
          console.error('Creating Reject name: ', err);
        } finally {
          this.submit = false;
          this.form.reset();
        }
      }
    }
  }

  public async onReset() {
    const result = await alertConfirm();
    if (result.value) {
      this.form.reset();
    }
  }

  public onEdit(idx: number) {
    this.bsModalRef = this.modalService.show(RejectCriteriaModalComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        data: {
          ...this.rejectNames[idx],
          ...{
            rid: this.rejectNames[idx].id
          }
        },
        categories: this.categories,
        faCodes: this.faCodes,
        holdCodes: this.holdCodes,
        mfgs: this.mfgs
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      // updating
      try {
        const response = await this.rejectService.updateRejectName(data.rid, data).toPromise();
        if (response.status === 200) {
          if (await alertSuccess()) {
            this.rejectNames[idx] = data;
          }
        }
      } catch (err) {
        console.error('Updating Reject name: ', err);
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 50);
      }
    });
  }

  public async onDelete(rid: string) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        // TODO
        const response = await this.rejectService.deleteRejectName(rid).toPromise();
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
      const response: ResponseObj = await this.rejectService
        .getRejectNames(
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
        this.rejectNames = response.data.data;
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
      const response: ResponseObj = await this.rejectService
        .getRejectNames(event.page, this.pagination.pageLength, orderBy, orderFrom, null, null, this.searching)
        .toPromise();
      if (response.status === 200) {
        this.rejectNames = response.data.data;
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
