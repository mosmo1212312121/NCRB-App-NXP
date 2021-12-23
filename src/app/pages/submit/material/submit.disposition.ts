import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BaseComponent, NxpSelection } from '../../../components';
import { DateConstant } from '../../../constants';
import { Lot, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService, MockService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, alertWarning } from '../../../utils';

@Component({
  selector: 'app-submit-disposition',
  templateUrl: './submit.disposition.html'
})
export class SubmitMaterialDispositionComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  dateConstant: DateConstant = new DateConstant();
  user: User = null;
  userSub: any = null;
  dispositionTypes: NxpSelection[] = [];
  reScreens: NxpSelection[] = [];
  public submit: boolean = false;
  public minDate: Date = null;
  public maxDate: Date = null;
  public loading: boolean = true;
  constructor(
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private ajax: AjaxService,
    private mock: MockService,
    private fb: FormBuilder,
    private router: Router,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('submit/material/disposition');

    this.form = this.fb.group({
      ncrbid: [null],
      lotId: [null],
      owner: [null],
      problemType: [{ value: null, disabled: true }],
      rescreen1: [{ value: null, disabled: true }, Validators.required],
      result1: [{ value: null, disabled: true }, Validators.required],
      fuByQa1: [{ value: null, disabled: true }],
      rescreen2: [{ value: null, disabled: true }, Validators.required],
      result2: [{ value: null, disabled: true }, Validators.required],
      fuByQa2: [{ value: null, disabled: true }],
      rescreen3: [{ value: null, disabled: true }, Validators.required],
      result3: [{ value: null, disabled: true }, Validators.required],
      fuByQa3: [{ value: null, disabled: true }],
      disposition: [null]
    });
    this.userSub = this.store.pipe(select('user')).subscribe(async (user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
        this.user = user;
      } else {
        this.user = null;
      }
      try {
        await this.getData();
      } catch (ex) {
        // On Crashed
        console.error('Submit Disposition (Prepare Data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.dispositionTypes = this.mock.getDispositionTypes();
    this.reScreens = this.mock.getReScreens();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  async getData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // TODO
      try {
        this.loading = true;
        const response: ResponseObj = await this.ajax.getMaterialById(parseInt(id, 10)).toPromise();
        if (response.status === 200 && response.data) {
          const lot: Lot = response.data;
          this.form.patchValue(lot);
          if (this.form.get('rescreen1').value && this.form.get('result1').value) {
            this.form.get('fuByQa1').enable();
          }
          if (this.form.get('rescreen2').value && this.form.get('result2').value) {
            this.form.get('fuByQa2').enable();
          }
          if (this.form.get('rescreen3').value && this.form.get('result3').value) {
            this.form.get('fuByQa3').enable();
          }

          // No Login No Action
          if (
            !this.user || // No User
            this.user?.empId === 'empId' || // No User
            this.form.get('disposition').value === 'Y' ||
            this.form.get('disposition').value === 'R' // Approve or Reject
          ) {
            this.form.disable();
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Submit Disposition (Prepare Data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async onApprove() {
    if (!this.user || this.user?.empId === 'empId') {
      alertWarning(`<p>Please login to proceed this process..</p>`);
      return;
    }
    // if (!this.isOwner && !this.isEsTime && !this.isNCRBOwner) {
    //   alertWarning(`<p>This account no permission to proceed this process..</p>`);
    //   return;
    // }
    this.submit = true;
    if (this.form.invalid) {
      return;
    }
    const result = await alertConfirm(`This process will \"Approve\" material: ${this.form.getRawValue().lotId}.`);
    if (result.value) {
      const id = this.route.snapshot.paramMap.get('id');
      const auth: string = localStorage.getItem('basic_auth');
      try {
        this.loading = true;
        const response: ResponseObj = await this.ajax
          .getMatDispositionApprove(
            parseInt(id, 10),
            auth,
            Object.assign({}, this.form.getRawValue(), { userName: this.user.username })
          )
          .toPromise();
        if (response.status === 200 && response.data) {
          this.form.get('disposition').patchValue('Y');
          this.form.get('fuByQa1').disable();
          this.form.get('fuByQa2').disable();
          this.form.get('fuByQa3').disable();
          alertSuccess();
        }
      } catch (ex) {
        // On Crashed
        console.error('Submit Disposition (Approve) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async onReject() {
    if (!this.user || this.user?.empId === 'empId') {
      alertWarning(`<p>Please login to proceed this process..</p>`);
      return;
    }
    // if (!this.isOwner && !this.isEsTime && !this.isNCRBOwner) {
    //   alertWarning(`<p>This account no permission to proceed this process..</p>`);
    //   return;
    // }
    const result = await alertConfirm(`This process will \"Reject\" material: ${this.form.getRawValue().lotId}.`);
    if (result.value) {
      const id = this.route.snapshot.paramMap.get('id');
      const auth: string = localStorage.getItem('basic_auth');
      this.loading = true;
      try {
        const response: ResponseObj = await this.ajax
          .getMatDispositionReject(
            parseInt(id, 10),
            auth,
            Object.assign({}, this.form.getRawValue(), { userName: this.user.username })
          )
          .toPromise();
        if (response.status === 200 && response.data) {
          this.form.get('disposition').patchValue('R');
          alertSuccess();
        }
      } catch (ex) {
        // On Crashed
        console.error('Submit Disposition (Reject) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  public onNcrbDetail(ncrbid: number) {
    this.router.navigate([`requests/detail/${ncrbid}`]);
  }

  // get isNCRBOwner() {
  //   return this.user?.username === this.form.getRawValue().owner;
  // }

  // get isOwner() {
  //   return (
  //     this.user &&
  //     this.form
  //       .getRawValue()
  //       .actionOwner.split(' ')[0]
  //       .trim()
  //       .toUpperCase() === this.user.empId.trim().toUpperCase()
  //   );
  // }

  // get isDriver() {
  //   return (
  //     this.user &&
  //     this.form
  //       .getRawValue()
  //       .actionDriver.split(' ')[0]
  //       .trim()
  //       .toUpperCase() === this.user.empId.trim().toUpperCase()
  //   );
  // }

  // get isEsTime() {
  //   const targetDate: number = parseInt(moment(this.form.getRawValue().targetDate).format('YYYYMMDD'), 10);
  //   const currentDate: number = parseInt(moment(new Date()).format('YYYYMMDD'), 10);
  //   return targetDate <= currentDate;
  // }
}
