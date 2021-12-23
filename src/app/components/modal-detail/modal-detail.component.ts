import { Component, EventEmitter, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { DateConstant, Status } from '../../constants';
import {
  ContainmentAction,
  Initial,
  IStatus,
  Minute,
  Owner,
  Parameter,
  ResponseObj,
  Score,
  User
} from '../../interfaces';
import { AjaxService, ComponentCanDeactivate } from '../../services';
import { setrequest } from '../../store/actions';
import { initialRequest } from '../../store/reducers';
import { IAppState } from '../../store/store';
import { alertConfirm, alertSuccess, filterByName } from '../../utils';
import { ChangeOwnerComponent } from '../../pages/request/modals/change-owner.component';
import { OwnersComponent } from '../../pages/request/modals/owners.component';

@Component({
  templateUrl: 'modal-detail.component.html'
})
export class ModalDetailComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  public event: EventEmitter<any> = new EventEmitter();
  form: FormGroup;
  formIn: FormGroup;
  lots: FormArray;
  lotsRemove: number[] = [];
  d3Ca: boolean = false;
  d3CaCd: boolean = false;
  d3Qa: ContainmentAction[] = [];
  d3Rc: ContainmentAction[] = [];
  d4: boolean = false;
  d5PCa: boolean = false;
  d5PCaCd: boolean = false;
  d6: boolean = false;
  d7Pr: boolean = false;
  d7PrCd: boolean = false;
  d8: boolean = false;
  d3Moms: Minute[] = [];
  typeName: string = '';
  submit: boolean = false;
  id: number = null;
  from: string = null;
  score: Score;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  _status: any = null;
  iStatusSub: any = null;
  status: Status = new Status();
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  ownerFilter = filterByName;
  testerClickIdx: number = -1;

  loading: boolean = false;
  isCollapsed: boolean = true;
  hasChange: boolean = false;

  currentSection = 'D1';

  d2Collapse: boolean = false;
  constructor(
    private bsModalRef: BsModalRef,
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private router: Router,
    private modalService: BsModalService
  ) {
    this.form = this.fb.group({
      /* Section 1 */
      ncnumber: [{ value: null, disabled: true }, Validators.required],
      date: [{ value: new Date(), disabled: true }, Validators.required],
      problemType: [null, Validators.required], // null
      issueByName: ['', Validators.required],
      mfg: [null, Validators.required], // null
      issueByGroup: [null, Validators.required],
      subMfg: [null, Validators.required],
      shift: [null, Validators.required],
      problemProcess: [null, Validators.required],
      special: [1], // Default `No`
      stopAndFix: [null, Validators.required],
      operation: [{ value: null, disabled: true }, Validators.required]
      /* Section 1 */
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.iStatusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      this._status = status;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.store.dispatch(setrequest(initialRequest));
  }

  // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return !this.hasChange;
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  scrollTo(section) {
    document.querySelector('#' + section).scrollIntoView();
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  onOwners() {
    this.bsModalRef = this.modalService.show(OwnersComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        owners: this.request.owners,
        ncrbid: this.request.id,
        ncrbno: this.request.ncnumber,
        username: this.user.username
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: Owner[]) => {
      this.request.owners = data;
      this.onChange();
    });
  }

  onChangeOwnerClick(): void {
    this.bsModalRef = this.modalService.show(ChangeOwnerComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        currentOwner: this.user.name,
        currentUser: this.user.name,
        isPemQa: this.request.isPemQa
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: string) => {
      const auth: string = localStorage.getItem('basic_auth');
      this.loading = true;
      try {
        const response: ResponseObj = await this.ajax
          .getChangeOwner(this.request.id, data, auth, this.request.isSubmit)
          .toPromise();
        if (response.data) {
          alertSuccess(
            `<p>ChangeOwner to "${data}" !</p>
          <span style="color: green; white-space: pre-line;">Successfully !</span>`,
            'Successful!',
            () => {
              this.hasChange = false;
              this.router.navigate([`/requests/list`], { skipLocationChange: true });
            }
          );
        }
      } catch (ex) {
        console.error('Request Detail (Change Owner) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.hasChange = false;
          this.loading = false;
        }, 50);
      }
    });
  }

  onD3SubmitRc(event: ContainmentAction[]): void {
    if (this.d3Rc.length > 0) {
      this.hasChange = true;
    }
    this.d3Rc = event;
    this.onChange();
  }

  onD3SubmitQa(event: ContainmentAction[]): void {
    if (this.d3Qa.length > 0) {
      this.hasChange = true;
    }
    this.d3Qa = event;
    this.onChange();
  }

  onD3SubmitCa(event: boolean): void {
    if (this.d3Ca) {
      this.hasChange = true;
    }
    this.d3Ca = event;
    this.onChange();
  }

  onD5SubmitPCa(event: boolean): void {
    if (this.d5PCa) {
      this.hasChange = true;
    }
    this.d5PCa = event;
    this.onChange();
  }

  onD7SubmitPr(event: boolean): void {
    if (this.d7Pr) {
      this.hasChange = true;
    }
    this.d7Pr = event;
    this.onChange();
  }

  onD3CaCd(event: boolean): void {
    if (this.d3CaCd) {
      this.hasChange = true;
    }
    this.d3CaCd = event;
    this.onChange();
  }

  onD5PCaCd(event: boolean): void {
    if (this.d5PCaCd) {
      this.hasChange = true;
    }
    this.d5PCaCd = event;
    this.onChange();
  }

  onD7PrCd(event: boolean): void {
    if (this.d7PrCd) {
      this.hasChange = true;
    }
    this.d7PrCd = event;
    this.onChange();
  }

  onD3SubmitMom(event: Minute[]): void {
    if (this.d3Moms.length > 0) {
      this.hasChange = true;
    }
    this.d3Moms = event;
    this.onChange();
  }

  onD4(event: boolean): void {
    this.d4 = event;
    this.onChange();
  }

  onD6(event: boolean): void {
    this.d6 = event;
  }

  onD8(event: boolean): void {
    this.d8 = event;
  }

  onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    this.request.isSubmitAll = this.isSubmitAll;
    this.request.d3CaCd = this.d3CaCd;
    this.request = Object.assign({}, this.request);
    this.store.dispatch(setrequest(this.request));
  }

  async onBack() {
    if (this.id && this.request.isEditingBy) {
      await this.ajax.updateEditing(this.id, 'null').toPromise();
    }
    if (this.from) {
      if (this.from === 'dashboard') {
        this.router.navigate([`/${this.from}`]);
      } else {
        this.router.navigate([`/requests/${this.from}`]);
      }
    } else {
      this.router.navigate([`/requests/list`]);
    }
  }

  onD2ToggleCollapse(event) {
    this.d2Collapse = event;
  }

  onFullMode() {
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.store.dispatch(setrequest(initialRequest));
    this.event.emit(true);
  }

  async onMerge() {
    try {
      const result = await alertConfirm(
        'Make sure, your want to merge lots to NCRB: ' + this.request.ncnumber,
        'Are you sure ?'
      );
      if (result.value) {
        this.event.emit(this.request);
        this.bsModalRef.hide();
      }
    } catch (ex) {
      // On Crashed
      console.error('Merge NCRB Modal Errors: ', ex);
    }
  }

  get isSubmitAll() {
    // D3.1: RC
    const RC: boolean = this.d3Rc.length > 0;
    // D3.2: QA
    const QA: boolean = this.d3Qa.length > 0;
    // D3.3: CA
    const CA: boolean = this.d3Ca;
    // D3.3: Moms
    const Moms: boolean = true; // this.d3Moms.length > 0;
    // D3.4: Moms
    const LDI: boolean = this.request.isInstruction;
    // D3.5: Lot Disposition
    const LD: boolean = this.request.isApproveAll;
    // D3.6: Material Disposition
    const MD: boolean = this.request.isApproveAll;

    return RC && QA && CA && Moms && LD && LDI && (this.request.isMaterial ? MD : true);
  }

  get isAllComplete(): boolean {
    // D4: Failure analysis and root cause / escape point
    const D4: boolean = this.d4;
    // D5: Permanent corrective actions
    const D5: boolean = this.d5PCa;
    // D6: Implement and verification of corrective actions
    const D6: boolean = this.d6;
    // D7: Prevent Recurrence
    const D7: boolean = this.d7Pr;
    // D8: Report
    const D8: boolean = this.d8;
    if (this._status.isD12D8 || this._status.isD12D83x5Why) {
      return this.isSubmitAll && D4 && D5 && D6 && D7 && D8;
    }

    return this.isSubmitAll;
  }
}
