import { AfterViewInit, Component, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { DateConstant } from '../../../constants';
import { Pagination, ResponseObj, Score } from '../../../interfaces';
import { AjaxService, DropdownService, LogService } from '../../../services';
import { alertConfirm } from '../../../utils';

@Component({
  selector: 'app-merge',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Merge NCRB</h5>
      <button type="button" class="close pull-right" aria-label="Close" (click)="onCancel()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body p-0">
      <div class="row">
        <div class="col-md-6 mx-auto">
          <div class="form-group">
            <div class="input-group mt-3 mb-3">
              <input
                type="text"
                class="form-control"
                id="input-seraching"
                name="input_searching"
                [(ngModel)]="searching"
                (enter)="onSearching()"
              />
              <div class="input-group-append">
                <button class="btn btn-secondary" type="button" id="button-searching" (click)="onSearching()">
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-12 mx-auto">
          <div class="table-responsive">
            <table class="table table-hover table-striped table-align-middle mb-0">
              <thead>
                <tr class="text-center">
                  <th style="width: 50px">#</th>
                  <th>NC Number</th>
                  <th>Problem Type</th>
                  <th>Date</th>
                  <th>Requester</th>
                  <th>Owner</th>
                  <th style="width: 50px">#</th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-center" *ngFor="let item of items; let i = index">
                  <td>{{ item.info.id }}</td>
                  <td>{{ item.info.ncnumber }}</td>
                  <td>{{ getProblem(item.info.problemType) }}</td>
                  <td>{{ item.info.date | date: dateConstant.format }}</td>
                  <td>{{ item.info.issueByName }}</td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-link btn-sm"
                      (click)="isCollapsedOwners[i] = !isCollapsedOwners[i]"
                      [attr.aria-expanded]="!isCollapsedOwners[i]"
                      attr.aria-controls="collapseOwners{{ i }}"
                    >
                      <i class="fa fa-{{ isCollapsedOwners[i] ? 'eye' : 'eye-slash' }} mr-1"></i
                      >{{ isCollapsedOwners[i] ? 'Show' : 'Hide' }}
                    </button>
                    <div id="collapseOwners{{ i }}" [collapse]="isCollapsedOwners[i]">
                      <div class="row" *ngFor="let owner of item.info.owners; let j = index">
                        <div class="col-12 text-left">
                          <span class="badge badge-secondary">{{ owner.name }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="width: 50px">
                    <button type="button" (click)="onMerge(i)" class="btn btn-sm btn-primary mx-1">
                      <i class="fa fa-reply-all mr-1"></i> Merge
                    </button>
                  </td>
                </tr>
                <tr class="text-center" *ngIf="items.length === 0">
                  <td colspan="7">No data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="row">
        <div class="col-12 d-flex justify-content-end">
          <p class="mr-2 my-0 py-1">
            Showing
            <b>{{
              (pagination.page - 1) * pagination.pageLength + 1 > pagination.total
                ? pagination.total
                : (pagination.page - 1) * pagination.pageLength + 1
            }}</b>
            to
            <b>{{
              pagination.page * pagination.pageLength > pagination.total
                ? pagination.total
                : pagination.page * pagination.pageLength
            }}</b>
            of <b>{{ pagination.total }}</b> rows
          </p>
          <pagination
            [maxSize]="10"
            [boundaryLinks]="true"
            [totalItems]="pagination.total"
            [(ngModel)]="pagination.page"
            (pageChanged)="onPageChanged($event)"
            previousText="&lsaquo;"
            nextText="&rsaquo;"
            firstText="&laquo;"
            lastText="&raquo;"
          >
          </pagination>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card:hover {
        cursor: pointer;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
      }
    `
  ]
})
export class MergeComponent extends BaseComponent implements OnInit, AfterViewInit {
  ncrbid: number;
  public items: Score[] = [];
  public dateConstant: DateConstant = new DateConstant();
  public event: EventEmitter<any> = new EventEmitter();
  public problemTypes: NxpSelection[] = [];
  public loading: boolean = true;
  public searching: string = '';
  sortBy: string = 'NCRBNO_DESC';
  startDate: Date = null;
  endDate: Date = null;
  pagination: Pagination = {
    page: 1,
    pageLength: 10,
    total: 0,
    totalPage: 0
  };
  isCollapsedOwners: boolean[] = [];
  bsModRef: BsModalRef;
  constructor(
    public bsModalRef: BsModalRef,
    private dropdown: DropdownService,
    private ajax: AjaxService,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('merge (modal)');
  }

  async ngOnInit() {
    try {
      this.loading = true;
      let response: ResponseObj = await this.ajax
        .getMergable(
          this.ncrbid,
          this.pagination.page,
          this.searching,
          this.pagination.pageLength,
          this.sortBy.split('_')[0],
          this.sortBy.split('_')[1]
        )
        .toPromise();
      // let response: ResponseObj = await this.ajax.getRequests().toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        for (let i = 0; i < this.items.length; i++) {
          this.isCollapsedOwners.push(true);
        }
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
        // await this.dropdown.getDropdowns().toPromise();
        response = await this.dropdown.getDropdownByGroup('PROBLEM').toPromise();
        this.problemTypes = response.data;
      }
    } catch (ex) {
      // TODO on Error
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit() {}

  async onMerge(idx: number) {
    try {
      const result = await alertConfirm(
        'Make sure, your want to merge lots to NCRB: ' + this.items[idx].info.ncnumber,
        'Are you sure ?'
      );
      if (result.value) {
        this.event.emit(this.items[idx].info);
        this.bsModalRef.hide();
      }
    } catch (ex) {
      // On Crashed
      console.error('Merge NCRB Modal Errors: ', ex);
    }

    // this.bsModRef = this.modalService.show(ModalDetailComponent, {
    //   ignoreBackdropClick: true,
    //   class: 'modal-xl modal-dialog-centered',
    //   initialState: {
    //     id: this.items[idx].info.id
    //   }
    // });
    // this.bsModRef.content.event.subscribe((merge: boolean) => {
    //   this.loading = true;
    //   try {
    //     if (merge) {
    //       this.event.emit(this.items[idx].info);
    //     }
    //     this.bsModRef.hide();
    //   } catch (ex) {
    //     console.error(ex);
    //   }
    // });
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  getProblem(problemType: number) {
    return this.problemTypes.length > 0 && this.problemTypes.find(obj => obj.id === problemType).label;
  }

  public async onSortByChange(event) {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      const response: ResponseObj = await this.ajax
        .getMergable(this.ncrbid, this.pagination.page, this.searching, this.pagination.pageLength, orderBy, orderFrom)
        .toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        this.isCollapsedOwners = [];
        for (let i = 0; i < this.items.length; i++) {
          this.isCollapsedOwners.push(true);
        }
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Sorting) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  public async onSearching() {
    try {
      this.loading = true;
      const orderBy: string = this.sortBy.split('_')[0];
      const orderFrom: string = this.sortBy.split('_')[1];
      const response: ResponseObj = await this.ajax
        .getMergable(this.ncrbid, 1, this.searching, this.pagination.pageLength, orderBy, orderFrom)
        .toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        this.pagination.page = 1;
        this.pagination = Object.assign({}, this.pagination, response.data.pagination);
        this.isCollapsedOwners = [];
        for (let i = 0; i < this.items.length; i++) {
          this.isCollapsedOwners.push(true);
        }
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
      const response: ResponseObj = await this.ajax
        .getMergable(this.ncrbid, event.page, this.searching, this.pagination.pageLength, orderBy, orderFrom)
        .toPromise();
      if (response.status === 200) {
        this.items = response.data.data;
        this.pagination.page = event.page;
        this.isCollapsedOwners = [];
        for (let i = 0; i < this.items.length; i++) {
          this.isCollapsedOwners.push(true);
        }
      }
    } catch (ex) {
      // On Crashed
      console.error('Requests (Change Page) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  getStartDate(): string {
    const startDate: Date = this.startDate;
    return startDate ? moment(startDate).format('YYYY-MM-DD') : null;
  }

  getEndDate(): string {
    const endDate: Date = this.endDate;
    return endDate ? moment(endDate).format('YYYY-MM-DD') : null;
  }
}

// <div class="modal-header">
//       <h5 class="modal-title pull-left">Merge NCRB</h5>
//       <button type="button" class="close pull-right" aria-label="Close" (click)="onCancel()">
//         <span aria-hidden="true">&times;</span>
//       </button>
//     </div>
//     <div class="modal-body" [formGroup]="formGroup">
//       <div class="row">
//         <div class="col-md-12 mx-auto">
//           <div class="row" *ngFor="let form of forms.controls; let i = index">
//             <div class="col-12">
//               <div
//                 (click)="onMerge(i)"
//                 class="card"
//                 [ngClass]="{ 'mb-3': i != forms.controls.length - 1, 'mb-0': i == forms.controls.length - 1 }"
//               >
//                 <div class="card-header">
//                   <h4 class="mb-0">NCRB : {{ form.get('ncnumber').value }}</h4>
//                 </div>
//                 <div class="card-body">
//                   <div class="row">
//                     <div class="col-lg-6">
//                       <nxp-input
//                         title="NC number"
//                         type="text"
//                         [parentForm]="form"
//                         color="bg-success"
//                         control="ncnumber"
//                         [submit]="submit"
//                         [group]="i"
//                       ></nxp-input>
//                     </div>
//                     <div class="col-lg-6">
//                       <nxp-input
//                         title="Date"
//                         type="date"
//                         [parentForm]="form"
//                         color="bg-success"
//                         control="date"
//                         [submit]="submit"
//                         [group]="i"
//                       ></nxp-input>
//                     </div>
//                     <div class="col-lg-6">
//                       <nxp-input
//                         title="Problem Type"
//                         type="text"
//                         [parentForm]="form"
//                         control="problemType"
//                         [submit]="submit"
//                         [group]="i"
//                       ></nxp-input>
//                     </div>
//                     <div class="col-lg-6">
//                       <nxp-input
//                         title="Issue By Name"
//                         type="text"
//                         [parentForm]="form"
//                         control="issueByName"
//                         [submit]="submit"
//                         [group]="i"
//                       ></nxp-input>
//                     </div>
//                     <div class="col-12 text-center">
//                       <button (click)="onMerge(i)" type="button" class="btn btn-sm btn-primary">
//                         <i class="fa fa-reply-all mr-1"></i>Merge
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
