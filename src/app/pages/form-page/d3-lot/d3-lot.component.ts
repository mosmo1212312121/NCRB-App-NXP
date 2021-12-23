import { keyframes } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { BaseComponent, NxpSelection } from '../../../components';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant, Status } from '../../../constants';
import { Initial, Lot, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, AuthService, DropdownService, LogService, MockService } from '../../../services';
import { setrequest } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, alertWarning, filterByName, SwalConfig } from '../../../utils';
import { FUbyQaApprovalComponent } from './approval.component';
import { EnterResultComponent } from './result.component';

@Component({
  selector: 'app-d3-lot',
  templateUrl: 'd3-lot.component.html'
})
export class D3LotComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() ncrbid: number = null;
  @Input() ncrbno: string = '';
  dispositionTypes: NxpSelection[] = [];
  reScreens: NxpSelection[] = [];
  formIn: FormGroup;
  lots: FormArray;
  histLots: any[] = [];
  lotsRemove: number[] = [];
  formInSubmit: boolean = false;
  typeName: string = '';
  userName: string = '';
  id: number = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  status: Status = new Status();
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  ownerFilter = filterByName;
  testerClickIdx: number = -1;

  chkAll: boolean = false;

  loading: boolean = false;
  processing: boolean = false;

  problemType: number = -1;
  public rescreenHistory: boolean = true;
  public collapse: boolean = false;
  private bsModalRef: BsModalRef = null;
  routeSub: any;
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dropdown: DropdownService,
    private auth: AuthService,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-lot');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });

    // initial form control
    this.formIn = this.fb.group({});

    // subscription for user state
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId') {
        this.user = user;
      } else {
        this.user = null;
      }
    });

    // subscription for request state
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      if (this.request.problemType !== this.problemType) {
        this.problemType = this.request.problemType;
        this.onTypeChange(this.problemType);
      }
      this.lots = this.formIn.get('lots') as FormArray;
      this.clearFormArray(this.lots);
      this.request.lots.sort(this.sorting);
      let groupname: number = 0;
      const groupnames: number[] = [];
      for (let i = 0; i < this.request.lots.length; i++) {
        const lot: Lot = this.request.lots[i];
        const obj: any = { submit: false, submit1: false, submit2: false, submit3: false };
        // obj.dispositionType = lot.dispositionType === 0 ? '' : lot.dispositionType;
        // if (lot.problemType !== 0 && !lot.dispositionType) {
        //   // Not problem type force select `Release`
        //   obj.dispositionType = 2;
        // }
        if (lot.disposition === 'W' || lot.disposition === 'N' || lot.disposition === 'F') {
          /**
           * 'W' => Waiting for instruction approve
           * 'F' => Waiting for finance and approve
           * 'N' => Waiting for add instruction
           *  others => stage lot disposition
           */
          continue; // skip this lot.
        }
        if (lot.groupName > 0) {
          // Finding header of Group
          if (lot.groupName > groupname) {
            // Header
            this.lots.push(this.fb.group({ ...{ selected: false }, ...lot, ...obj, ...{ id: -1 } }));

            // re-assign groupname
            groupname = lot.groupName;
            groupnames.push(groupname);
          }

          // Children
          this.lots.push(this.fb.group({ ...{ selected: false }, ...lot, ...obj }));
        } else if (lot.disposition === 'H') {
          // Children
          this.lots.push(this.fb.group({ ...{ selected: false }, ...lot, ...obj }));
        }
      }
      this.lots.disable();
      const { isOwner, isFuQa, isPemQa } = this.request;
      for (let i = 0; i < this.lots.length; i++) {
        const lot: Lot = this.lots.getRawValue()[i];
        const { disposition, id, problemType } = lot;
        if ((disposition === 'I' || disposition === 'R') && id > -1) {
          // if ((disposition === 'I' || disposition === 'R') && isOwner && id > -1) {
          // when lot is pending and rejected and user role is owner of NCRB
          // this.requiredLotValidator(i, 'dispositionType');
          for (let j = 1; j <= 3; j++) {
            if (j === 1) {
              this.enableLot(i, j, problemType === 0);
            } else if ((j - 1 > 0 && lot[`rescreen${j - 1}`]) || lot[`rescreen${j}`]) {
              this.enableLot(i, j, problemType === 0 && lot[`rescreen${j}`]);
            } else {
              this.disableLot(i, j);
            }
          }
          this.lots
            .at(i)
            .get(`selected`)
            .disable();
        } else {
          for (let j = 1; j <= 3; j++) {
            if (j === 1 && !lot[`fuByQa${j}`] && disposition === 'P') {
              if (problemType === 0 && isFuQa && lot[`rescreen${j}`]) {
                this.requiredLotValidator(i, `fuByQa${j}`);
                this.lots
                  .at(i)
                  .get(`selected`)
                  .disable();
              } else if (problemType !== 0 && isPemQa) {
                this.clearLotValidator(i, `fuByQa${j}`);
                this.lots
                  .at(i)
                  .get(`selected`)
                  .disable();
              }
            } else if (j - 1 > 0 && lot[`rescreen${j - 1}`] && disposition === 'P') {
              if (problemType === 0 && isFuQa && lot[`rescreen${j}`]) {
                this.requiredLotValidator(i, `fuByQa${j}`);
                this.lots
                  .at(i)
                  .get(`selected`)
                  .disable();
              } else if (problemType !== 0 && this.request.isPemQa) {
                this.clearLotValidator(i, `fuByQa${j}`, true);
                this.lots
                  .at(i)
                  .get(`selected`)
                  .disable();
              }
            } else {
              if ((this.request.isEngineer && disposition === 'E') || (this.request.isMte && disposition === 'Y')) {
                this.lots
                  .at(i)
                  .get(`selected`)
                  .enable();
              } else {
                this.disableLot(i, j);
              }
            }
          }
        }

        // Enable Checkbox header but will disable for
        if (id === -1) {
          this.lots
            .at(i)
            .get('selected')
            .enable();
        }
      }
      if (this.id !== this.request.id) {
        // On detail page
        this.id = this.request.id;
        this.formIn.updateValueAndValidity();
        if (!this.request.isOwner || this.request.isMerged) {
          this.formIn.disable();
        } else {
          this.formIn.enable();
        }
        this.onChange();
      }

      // Checking Checkbox Group Disabled
      for (let i = 0; i < groupnames.length; i++) {
        let disabled: boolean = true;
        for (let j = 0; j < this.lots.length; j++) {
          const { id, groupName } = this.lots.getRawValue()[j];
          if (id !== -1 && groupName === groupnames[i]) {
            if (!this.lots.at(j).get('selected').disabled) {
              disabled = false;
            }
          }
        }

        // Disabled Checkbox Group
        if (disabled) {
          for (let j = 0; j < this.lots.length; j++) {
            const { groupName } = this.lots.getRawValue()[j];
            if (groupName === groupnames[i]) {
              this.lots
                .at(j)
                .get('selected')
                .disable();
            }
          }
        }
      }

      if (this.isSelectedDisabled) {
        this.formIn.get('selectedCheck').disable();
      } else {
        this.formIn.get('selectedCheck').enable();
      }
    });
  }

  async ngOnInit() {
    const dispositionTypes = this.dropdown.getDropdownByGroup('DISPOSITION').toPromise();
    const reScreens = this.dropdown.getDropdownByGroup('RESCREEN').toPromise();
    const hists = this.ajax.getLotsHist(this.ncrbno).toPromise();
    try {
      // get history
      this.dispositionTypes = (await dispositionTypes).data;
      this.reScreens = (await reScreens).data;
      this.histLots = (await hists).data;
      this.onChange();
    } catch (ex) {
      console.error('D3 Lot (History) Errors: ', ex);
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D3-LOT') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.auth.disconnect();
  }

  sorting(a, b) {
    if (a.groupName < b.groupName) {
      return -1;
    }
    if (a.groupName > b.groupName) {
      return 1;
    }
    return 0;
  }

  onTypeChange(event: number): void {
    if (event && typeof event !== 'object') {
      switch (parseInt(event.toString(), 10)) {
        // case 1: // In Process
        //   this.typeName = 'In-process';
        //   this.onInProcess();
        //   break;
        case 2: // Previous Process
          this.typeName = 'Feedback from previous process';
          this.onPreviousProcess();
          break;
        case 3: // Material
          this.typeName = 'Material';
          this.onMaterial();
          break;
        case 4: // On Hold
          this.typeName = 'On Hold';
          this.onOnHold();
          break;
        default:
          this.typeName = 'In-process';
          this.onInProcess();
          break;
      }
    } else {
      this.typeName = 'In-process';
      this.onInProcess();
    }
  }

  onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    // On Everything Change
    this.chkAll = false;
    this.formIn.get('selectedCheck').patchValue(false);
    if (this.isSelectedDisabled) {
      this.formIn.get('selectedCheck').disable();
    }
    this.request.isApproveAll = this.isApproveAll;
    this.request.isDispositionAll = this.isDispositionAll;
    this.request.has3HistLots = this.has3HistLots();
    this.request = { ...{}, ...this.request };
    this.store.dispatch(setrequest(this.request));
  }

  onMteApproval(idx: number): void {
    this.lots = this.formIn.get('lots') as FormArray;
    const lot: Lot = this.lots.getRawValue()[idx];
    if (lot.problemType === 0 && this.lots.at(idx).invalid) {
      this.lots.at(idx).patchValue({
        submit: true,
        submit1: true,
        submit2: true,
        submit3: true
      });
      return;
    }
    alertConfirm(`Make sure, you will approval Lot: ${lot.lotId}.`, 'Are you sure ?', async result => {
      if (result.value) {
        this.processing = true;
        try {
          const response: ResponseObj = await this.ajax
            .getLotDispositionApprove(lot.id, this.auth.getAuth(), {
              ...{},
              ...lot,
              ...{ userName: this.user.username }
            })
            .toPromise();
          if (response.status === 200 && response.data) {
            for (let i = 0; i < this.request.lots.length; i++) {
              const obj: Lot = this.request.lots[i];
              this.request.lots[i].selected = false;
              if (this.lots.at(i)) {
                this.lots
                  .at(i)
                  .get('selected')
                  .patchValue(false);
              }
              if (obj.id === lot.id) {
                this.request.lots[i] = {
                  ...lot,
                  ...{
                    disposition: 'Z'
                  }
                };
              }
            }
            this.lots.at(idx).patchValue({
              ...lot,
              ...{
                disposition: 'Y'
              }
            });
            this.onChange();
            alertSuccess(
              `<p>Approved form D3 (Lot Disposition), lot: ${lot.lotId} !</p>
                <span style="color: green; white-space: pre-line;">Approval lot completed !</span>`,
              'Successful!',
              () => {
                window.location.reload();
                // this.store.dispatch(setrequest(this.request));
                // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
              }
            );
          }
        } catch (ex) {
          // On Crashed
          console.error('D3 Lots (Engineer Approval) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.processing = false;
          }, 50);
        }
      }
    });
  }

  onApprove(idx: number): void {
    this.lots = this.formIn.get('lots') as FormArray;
    const lot: Lot = this.lots.getRawValue()[idx];
    if (lot.problemType === 0 && this.lots.at(idx).invalid) {
      this.lots.at(idx).patchValue({
        submit: true,
        submit1: true,
        submit2: true,
        submit3: true
      });
      return;
    }
    alertConfirm(`Make sure, you will approval Lot: ${lot.lotId}.`, 'Are you sure ?', async result => {
      if (result.value) {
        this.processing = true;
        // is retest ?
        lot.retest =
          this.dropdown.isRetest(lot.rescreen1.toString()) ||
          this.dropdown.isRetest(lot.rescreen2.toString()) ||
          this.dropdown.isRetest(lot.rescreen3.toString());
        try {
          const response: ResponseObj = await this.ajax
            .getLotDispositionApprove(lot.id, this.auth.getAuth(), {
              ...{},
              ...lot,
              ...{ userName: this.user.username }
            })
            .toPromise();
          if (response.status === 200 && response.data) {
            for (let i = 0; i < this.request.lots.length; i++) {
              const obj: Lot = this.request.lots[i];
              this.request.lots[i].selected = false;
              if (this.lots.at(i)) {
                this.lots
                  .at(i)
                  .get('selected')
                  .patchValue(false);
              }
              if (obj.id === lot.id) {
                this.request.lots[i] = {
                  ...lot,
                  ...{ disposition: lot.retest ? 'Y' : 'Z' }
                };
              }
            }
            this.lots.at(idx).patchValue({
              ...lot,
              ...{ disposition: lot.retest ? 'Y' : 'Z' }
            });
            this.onChange();
            alertSuccess(
              `<p>Approved form D3 (Lot Disposition), lot: ${lot.lotId} !</p>
                <span style="color: green; white-space: pre-line;">Approval lot completed !</span>`,
              'Successful!',
              () => {
                window.location.reload();
                // this.store.dispatch(setrequest(this.request));
                // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
              }
            );
          }
        } catch (ex) {
          // On Crashed
          console.error('D3 Lots (Engineer Approval) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.processing = false;
          }, 50);
        }
      }
    });
  }

  async onReject(idx: number, reason: string = '') {
    this.lots = this.formIn.get('lots') as FormArray;
    const lot: Lot = this.lots.getRawValue()[idx];

    // Clear validation
    this.clearLotValidator(idx, 'result1');
    this.clearLotValidator(idx, 'result2');
    this.clearLotValidator(idx, 'result3');
    this.clearLotValidator(idx, 'fuByQa1');
    this.clearLotValidator(idx, 'fuByQa2');
    this.clearLotValidator(idx, 'fuByQa3');

    // Check invalid
    if (lot.problemType === 0 && this.lots.at(idx).invalid) {
      this.lots.at(idx).patchValue({
        submit: true,
        submit1: true,
        submit2: true,
        submit3: true
      });
      return;
    }
    // Swal.fire({
    //   ...SwalConfig,
    //   title: `Reject Lot: ${lot.lotId} reason.. `,
    //   confirmButtonText: 'Confirm',
    //   cancelButtonText: 'Cancel',
    //   input: 'text',
    //   inputPlaceholder: 'Enter your reject reason',
    //   showCancelButton: true
    // }).then(async result => {
    //   if (result.value) {

    //   }
    // });
    this.processing = true;
    try {
      lot.rejectDetail = reason;
      let response: ResponseObj = await this.ajax
        .getLotDispositionReject(lot.id, this.auth.getAuth(), Object.assign({}, lot, { userName: this.user.username }))
        .toPromise();
      if (response.status === 200 && response.data) {
        for (let i = 0; i < this.request.lots.length; i++) {
          const obj: Lot = this.request.lots[i];
          this.request.lots[i].selected = false;
          if (this.lots.at(i)) {
            this.lots
              .at(i)
              .get('selected')
              .patchValue(false);
          }
          if (obj.id === lot.id) {
            this.request.lots[i].disposition = 'N';
            // this.lots.removeAt(idx);
            this.request.lots[i] = {
              ...lot,
              ...{
                fuByQa1: '',
                fuByQa2: '',
                fuByQa3: '',
                result1: '',
                result2: '',
                result3: '',
                resultBy1: '',
                resultBy2: '',
                resultBy3: '',
                disposition: 'N',
                dispositionType: null
              }
            };
            this.lots.at(idx).patchValue(this.request.lots[i]);
          }
        }
        response = await this.ajax.getLotsHist(this.ncrbno).toPromise();
        if (response.status === 200) {
          this.histLots = response.data;
        }
        this.onChange();
        alertSuccess(
          `<p>Reject form D3 (Lot Disposition), lot: ${lot.lotId} !</p>
                <span style="color: green; white-space: pre-line;">Reject lot completed !</span>`,
          'Successful!',
          () => {
            window.location.reload();
            // this.store.dispatch(setrequest(this.request));
            // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
          }
        );
      }
    } catch (ex) {
      // On Crashed
      console.error('D3 Lots (Engineer Reject) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.processing = false;
      }, 50);
    }
  }

  onScrap(idx: number): void {
    alertConfirm(
      `Make sure, you will scrap lot ${this.lots.at(idx).get('lotId').value}.`,
      'Are you sure ?',
      async result => {
        if (result) {
          try {
            // finding last groupName
            let lastGroupName = 0;
            for (let i = 0; i < this.request.lots.length; i++) {
              const groupName = this.request.lots[i].groupName;
              if (lastGroupName < groupName) {
                lastGroupName = groupName;
              }
            }
            lastGroupName++;

            this.lots
              .at(idx)
              .get('dispositionType')
              .patchValue(1);
            this.lots
              .at(idx)
              .get('groupName')
              .patchValue(lastGroupName);
            const response: ResponseObj = await this.ajax
              .getLotDispositionScrap(
                this.lots.at(idx).get('id').value,
                this.auth.getAuth(),
                Object.assign({}, this.lots.getRawValue()[idx], { userName: this.user.username })
              )
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                const obj: Lot = this.request.lots[i];
                this.request.lots[i].selected = false;
                if (this.lots.at(i)) {
                  this.lots
                    .at(i)
                    .get('selected')
                    .patchValue(false);
                }
                if (obj.id === this.lots.at(idx).get('id').value) {
                  this.request.lots[i].disposition = 'F';
                  this.request.lots[i].dispositionType = 1;
                  this.lots.at(idx).patchValue(this.request.lots[idx]);
                }
              }
              alertSuccess(
                `<p>Scrap form D3 (Lot Disposition), lot: ${this.request.lots[idx].lotId} !</p>
                  <span style="color: green; white-space: pre-line;">Scrap lot completed !</span>`,
                'Successful!',
                () => {
                  window.location.reload();
                  // this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
              this.onChange();
            }
          } catch (ex) {
            console.error('D3 Lot (Scrap) Errors: ', ex);
          }
        }
      }
    );
  }

  onSubmitFuByQa(idx: number, at: string): void {
    this.bsModalRef = this.modalService.show(FUbyQaApprovalComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        user: this.user
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      this.loading = true;
      try {
        this.userName = data.name;
        const lot: Lot = this.lots.getRawValue()[idx];
        lot[`fuByQa${at}`] = data.name.split('-')[1].trim();
        this.lots.at(idx).patchValue({ ...lot });

        if (data.result) {
          // submit fuByQa
          this.onFuByQaUpdate(idx);
        } else {
          // reject lot
          this.onReject(idx, data.reason);
        }
      } catch (ex) {
        console.error('onSubmitFuByQa Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 50);
      }
    });
  }

  onUpdateResult(idx: number, at: string): void {
    this.bsModalRef = this.modalService.show(EnterResultComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        data: {
          rescreen: this.lots.getRawValue()[idx]['rescreen' + at],
          result: ''
        }
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      this.loading = true;
      try {
        this.lots
          .at(idx)
          .get('result' + at)
          .patchValue(data.result);
        this.lots
          .at(idx)
          .get('rescreen' + at)
          .patchValue(data.rescreen);
        this.onDispositionUpdate(idx);
      } catch (ex) {
        console.error('onSubmitFuByQa Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 50);
      }
    });
  }

  async onDispositionUpdate(idx: number) {
    this.lots = this.formIn.get('lots') as FormArray;
    const lot: Lot = this.lots.getRawValue()[idx];

    // Clear validation
    this.clearLotValidator(idx, 'result1');
    this.clearLotValidator(idx, 'result2');
    this.clearLotValidator(idx, 'result3');
    this.clearLotValidator(idx, 'fuByQa1');
    this.clearLotValidator(idx, 'fuByQa2');
    this.clearLotValidator(idx, 'fuByQa3');

    if (lot.problemType === 0 && this.lots.at(idx).invalid) {
      this.lots.at(idx).patchValue({
        submit: true,
        submit1: true,
        submit2: true,
        submit3: true
      });
      const keys: string[] = Object.keys(this.lots.getRawValue()[idx]);
      for (let i = 0; i < keys.length; i++) {
        if (this.lots.at(idx).get(keys[i]).invalid) {
          console.log(keys[i] + ' is required');
        }
      }
      return;
    }
    this.processing = true;
    try {
      const response: ResponseObj = await this.ajax
        .getSubmitLotDispositionUpdate(lot.id, { ...{}, ...lot, ...{ userName: this.user.username } })
        .toPromise();
      if (response.status === 200 && response.data) {
        let submittedAllResult: boolean = true;

        // check submit result all
        if (lot.rescreen1) {
          if (!lot.result1) {
            submittedAllResult = false;
          }
        }
        if (lot.rescreen2) {
          if (!lot.result2) {
            submittedAllResult = false;
          }
        }
        if (lot.rescreen3) {
          if (!lot.result3) {
            submittedAllResult = false;
          }
        }

        // re-assign lot
        const _lot = {
          ...lot,
          ...{
            disposition: submittedAllResult && lot.problemType !== 0 ? 'E' : 'P'
          }
        };

        for (let i = 0; i < this.request.lots.length; i++) {
          const obj: Lot = this.request.lots[i];
          this.request.lots[i].selected = false;
          this.lots
            .at(i)
            .get('selected')
            .patchValue(false);
          if (obj.id === lot.id) {
            this.request.lots[i] = _lot;
          }
        }
        this.lots.at(idx).patchValue(_lot);

        // update store to state
        this.onChange();

        alertSuccess(
          `<p>Submit result form D3 (Lot Disposition), lot: ${lot.lotId} !</p>
                <span style="color: green; white-space: pre-line;">Submit completed waiting for approval from approval board !</span>`,
          'Successful!',
          () => {
            this.store.dispatch(setrequest(this.request));
            // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
          }
        );
      }
    } catch (ex) {
      // On Crashed
      console.error('D3 Lots (Disposition) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.processing = false;
      }, 50);
    }
  }

  async onFuByQaUpdate(idx: number) {
    this.lots = this.formIn.get('lots') as FormArray;
    const lot: Lot = this.lots.getRawValue()[idx];

    // Clear validation
    this.clearLotValidator(idx, 'result1');
    this.clearLotValidator(idx, 'result2');
    this.clearLotValidator(idx, 'result3');
    this.clearLotValidator(idx, 'fuByQa1');
    this.clearLotValidator(idx, 'fuByQa2');
    this.clearLotValidator(idx, 'fuByQa3');

    if (lot.problemType === 0 && this.lots.at(idx).invalid) {
      this.lots.at(idx).patchValue({
        submit: true,
        submit1: true,
        submit2: true,
        submit3: true
      });
      const keys: string[] = Object.keys(this.lots.getRawValue()[idx]);
      for (let i = 0; i < keys.length; i++) {
        if (this.lots.at(idx).get(keys[i]).invalid) {
          console.log(keys[i] + ' is required');
        }
      }
      return;
    }
    this.processing = true;
    try {
      const response: ResponseObj = await this.ajax
        .getSubmitLotFuByQaUpdate(lot.id, { ...{}, ...lot, ...{ userName: this.userName } })
        .toPromise();
      if (response.status === 200 && response.data) {
        let submittedAllResult: boolean = true;
        let submittedAllFuByQa: boolean = true;

        // check submit result all
        if (lot.rescreen1) {
          if (!lot.result1) {
            submittedAllResult = false;
          }
        }
        if (lot.rescreen2) {
          if (!lot.result2) {
            submittedAllResult = false;
          }
        }
        if (lot.rescreen3) {
          if (!lot.result3) {
            submittedAllResult = false;
          }
        }

        // check submit fuByQa all
        if (!submittedAllResult) {
          submittedAllFuByQa = false;
        } else {
          if (lot.result1) {
            if (!lot.fuByQa1) {
              submittedAllFuByQa = false;
            }
          }
          if (lot.result2) {
            if (!lot.fuByQa2) {
              submittedAllFuByQa = false;
            }
          }
          if (lot.result3) {
            if (!lot.fuByQa3) {
              submittedAllFuByQa = false;
            }
          }
        }

        // re-assign lot
        const _lot = {
          ...lot,
          ...{
            disposition: submittedAllResult && submittedAllFuByQa ? 'E' : 'P'
          }
        };

        // de-select and re-assign target lot
        for (let i = 0; i < this.request.lots.length; i++) {
          const obj: Lot = this.request.lots[i];
          this.request.lots[i].selected = false;
          this.lots
            .at(i)
            .get('selected')
            .patchValue(false);
          if (obj.id === lot.id) {
            this.request.lots[i] = _lot;
          }
        }
        this.lots.at(idx).patchValue(_lot);

        // update store to state
        this.onChange();

        alertSuccess(
          `<p>Submit FU by QA form D3, lot: ${lot.lotId} !</p>
                <span style="color: green; white-space: pre-line;">Submit completed waiting for ${
                  submittedAllResult && submittedAllFuByQa ? 'approval from engineer' : 'others FU by QA complete'
                } !</span>`,
          'Successful!',
          () => {
            this.store.dispatch(setrequest(this.request));
            // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
          }
        );
      }
    } catch (ex) {
      // On Crashed
      console.error('D3 Lots (FU by QA) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.processing = false;
      }, 50);
    }
  }

  onPemQaApprovalAll(): void {
    this.formInSubmit = true;
    this.lots = this.formIn.get('lots') as FormArray;
    let valid: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      const { id, disposition, selected } = this.lots.getRawValue()[i];
      if (id > -1 && disposition === 'Y' && disposition && selected) {
        this.lots
          .at(i)
          .get('submit')
          .patchValue(true);
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(true);
        }
        if (this.lots.at(i).invalid) {
          valid = false;
        }
      } else {
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(false);
        }
        this.lots
          .at(i)
          .get(`selected`)
          .patchValue(false);
      }
    }
    if (valid) {
      alertConfirm('Make sure, you will submit disposition all lot.', 'Are you sure ?', async result => {
        if (result.value) {
          this.processing = true;
          try {
            const lotsL = this.lots
              .getRawValue()
              .filter(obj => obj.selected === true && obj.disposition === 'Y' && obj.id > -1);
            for (let i = 0; i < lotsL.length; i++) {
              lotsL[i].userName = this.user.username;
            }
            const response: ResponseObj = await this.ajax
              .getMteApprovalAll(this.request.ncnumber.toString(), lotsL)
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                if (this.hasLot(lotsL, this.request.lots[i].id) && this.request.lots[i].disposition === 'Y') {
                  this.request.lots[i].disposition = 'Z';
                  this.request.lots[i].selected = false;
                }
              }
              for (let i = 0; i < this.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.lots.getRawValue()[i].id) &&
                  this.lots.at(i).get('disposition').value === 'Y'
                ) {
                  this.lots
                    .at(i)
                    .get('disposition')
                    .patchValue({
                      disposition: 'Z',
                      selected: false
                    });
                }
              }
              this.onChange();
              alertSuccess(
                `<p>Submitted form D3 (Lot Disposition) All Lot !</p>
                  <span style="color: green; white-space: pre-line;">Submit completed, waiting for approval from approval board !</span>`,
                'Successful!',
                () => {
                  this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // On Crashed
            console.error('D3 Lots (Mte All) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  onPemQaScrapAll(): void {
    // finding last groupName
    let lastGroupName = 0;
    for (let i = 0; i < this.lots.length; i++) {
      const groupName = this.lots.at(i).get('groupName').value;
      if (lastGroupName < parseInt(groupName, 10)) {
        lastGroupName = parseInt(groupName, 10);
      }
    }
    lastGroupName++;

    this.formInSubmit = true;
    this.lots = this.formIn.get('lots') as FormArray;
    let valid: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      if (
        this.lots.at(i).get('id').value > -1 &&
        this.lots.at(i).get('problemType').value === 0 &&
        this.lots.at(i).get('disposition').value === 'Y' &&
        this.lots.at(i).get('selected').value
      ) {
        this.lots
          .at(i)
          .get('submit')
          .patchValue(true);
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(true);
        }
        if (this.lots.at(i).invalid) {
          valid = false;
        }
      } else {
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(false);
        }
        this.lots
          .at(i)
          .get(`selected`)
          .patchValue(false);
      }
    }
    if (valid) {
      alertConfirm('Make sure, you will submit disposition all lot.', 'Are you sure ?', async result => {
        if (result.value) {
          this.processing = true;
          try {
            const lotsL = this.lots
              .getRawValue()
              .filter(obj => obj.selected === true && obj.disposition === 'Y' && obj.problemType === 0);
            for (let i = 0; i < lotsL.length; i++) {
              lotsL[i].userName = this.user.username;
              lotsL[i].groupName = lastGroupName;
            }
            const response: ResponseObj = await this.ajax
              .getEngineerScrapAll(this.request.ncnumber.toString(), lotsL)
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.request.lots[i].id) &&
                  this.request.lots[i].disposition === 'Y' &&
                  this.request.lots[i].problemType === 0
                ) {
                  this.request.lots[i].disposition = 'F';
                  this.request.lots[i].dispositionType = 1;
                  this.request.lots[i].selected = false;
                }
              }
              for (let i = 0; i < this.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.lots.getRawValue()[i].id) &&
                  this.lots.at(i).get('disposition').value === 'Y' &&
                  this.lots.at(i).get('problemType').value === 0
                ) {
                  this.lots
                    .at(i)
                    .get('disposition')
                    .patchValue({
                      disposition: 'F',
                      dispositionType: 1,
                      selected: false
                    });
                }
              }
              this.onChange();
              alertSuccess(
                `<p>Submitted form D3 (Lot Disposition) All Lot !</p>
                  <span style="color: green; white-space: pre-line;">Submit completed, waiting for approval from approval board !</span>`,
                'Successful!',
                () => {
                  window.location.reload();
                  // this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // On Crashed
            console.error('D3 Lots (Scrap All) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  onMteApprovalAll(): void {
    this.formInSubmit = true;
    this.lots = this.formIn.get('lots') as FormArray;
    let valid: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      const { id, disposition, selected } = this.lots.getRawValue()[i];
      if (id > -1 && disposition === 'Y' && disposition && selected) {
        this.lots
          .at(i)
          .get('submit')
          .patchValue(true);
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(true);
        }
        if (this.lots.at(i).invalid) {
          valid = false;
        }
      } else {
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(false);
        }
        this.lots
          .at(i)
          .get(`selected`)
          .patchValue(false);
      }
    }
    if (valid) {
      alertConfirm('Make sure, you will submit disposition all lot.', 'Are you sure ?', async result => {
        if (result.value) {
          this.processing = true;
          try {
            const lotsL = this.lots
              .getRawValue()
              .filter(obj => obj.selected === true && obj.disposition === 'Y' && obj.id > -1);
            for (let i = 0; i < lotsL.length; i++) {
              lotsL[i].userName = this.user.username;
            }
            const response: ResponseObj = await this.ajax
              .getMteApprovalAll(this.request.ncnumber.toString(), lotsL)
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                if (this.hasLot(lotsL, this.request.lots[i].id) && this.request.lots[i].disposition === 'Y') {
                  this.request.lots[i].disposition = 'Z';
                  this.request.lots[i].selected = false;
                }
              }
              for (let i = 0; i < this.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.lots.getRawValue()[i].id) &&
                  this.lots.at(i).get('disposition').value === 'Y'
                ) {
                  this.lots
                    .at(i)
                    .get('disposition')
                    .patchValue({
                      disposition: 'Z',
                      selected: false
                    });
                }
              }
              this.onChange();
              alertSuccess(
                `<p>Submitted form D3 (Lot Disposition) All Lot !</p>
                  <span style="color: green; white-space: pre-line;">Submit completed, waiting for approval from approval board !</span>`,
                'Successful!',
                () => {
                  this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // On Crashed
            console.error('D3 Lots (Mte All) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  onMteScrapAll(): void {
    // finding last groupName
    let lastGroupName = 0;
    for (let i = 0; i < this.lots.length; i++) {
      const groupName = this.lots.at(i).get('groupName').value;
      if (lastGroupName < parseInt(groupName, 10)) {
        lastGroupName = parseInt(groupName, 10);
      }
    }
    lastGroupName++;

    this.formInSubmit = true;
    this.lots = this.formIn.get('lots') as FormArray;
    let valid: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      if (
        this.lots.at(i).get('id').value > -1 &&
        this.lots.at(i).get('problemType').value === 0 &&
        this.lots.at(i).get('disposition').value === 'Y' &&
        this.lots.at(i).get('selected').value
      ) {
        this.lots
          .at(i)
          .get('submit')
          .patchValue(true);
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(true);
        }
        if (this.lots.at(i).invalid) {
          valid = false;
        }
      } else {
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(false);
        }
        this.lots
          .at(i)
          .get(`selected`)
          .patchValue(false);
      }
    }
    if (valid) {
      alertConfirm('Make sure, you will submit disposition all lot.', 'Are you sure ?', async result => {
        if (result.value) {
          this.processing = true;
          try {
            const lotsL = this.lots
              .getRawValue()
              .filter(obj => obj.selected === true && obj.disposition === 'Y' && obj.problemType === 0);
            for (let i = 0; i < lotsL.length; i++) {
              lotsL[i].userName = this.user.username;
              lotsL[i].groupName = lastGroupName;
            }
            const response: ResponseObj = await this.ajax
              .getEngineerScrapAll(this.request.ncnumber.toString(), lotsL)
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.request.lots[i].id) &&
                  this.request.lots[i].disposition === 'Y' &&
                  this.request.lots[i].problemType === 0
                ) {
                  this.request.lots[i].disposition = 'F';
                  this.request.lots[i].dispositionType = 1;
                  this.request.lots[i].selected = false;
                }
              }
              for (let i = 0; i < this.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.lots.getRawValue()[i].id) &&
                  this.lots.at(i).get('disposition').value === 'Y' &&
                  this.lots.at(i).get('problemType').value === 0
                ) {
                  this.lots
                    .at(i)
                    .get('disposition')
                    .patchValue({
                      disposition: 'F',
                      dispositionType: 1,
                      selected: false
                    });
                }
              }
              this.onChange();
              alertSuccess(
                `<p>Submitted form D3 (Lot Disposition) All Lot !</p>
                  <span style="color: green; white-space: pre-line;">Submit completed, waiting for approval from approval board !</span>`,
                'Successful!',
                () => {
                  window.location.reload();
                  // this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // On Crashed
            console.error('D3 Lots (Scrap All) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  onEngineerApprovalAll(): void {
    this.formInSubmit = true;
    this.lots = this.formIn.get('lots') as FormArray;
    let valid: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      if (
        this.lots.at(i).get('id').value > -1 &&
        this.lots.at(i).get('problemType').value === 0 &&
        this.lots.at(i).get('disposition').value === 'E' &&
        this.lots.at(i).get('selected').value
      ) {
        this.lots
          .at(i)
          .get('submit')
          .patchValue(true);
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(true);
        }
        if (this.lots.at(i).invalid) {
          valid = false;
        }
      } else {
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(false);
        }
        this.lots
          .at(i)
          .get(`selected`)
          .patchValue(false);
      }
    }
    if (valid) {
      alertConfirm('Make sure, you will submit disposition all lot.', 'Are you sure ?', async result => {
        if (result.value) {
          this.processing = true;
          try {
            const lotsL = this.lots
              .getRawValue()
              .filter(obj => obj.selected === true && obj.disposition === 'E' && obj.problemType === 0);
            for (let i = 0; i < lotsL.length; i++) {
              const { rescreen1, rescreen2, rescreen3 } = lotsL[i];
              const retest: boolean =
                this.dropdown.isRetest(rescreen1.toString()) ||
                this.dropdown.isRetest(rescreen2.toString()) ||
                this.dropdown.isRetest(rescreen3.toString());
              lotsL[i].retest = retest;
              lotsL[i].userName = this.user.username;
            }
            const response: ResponseObj = await this.ajax
              .getEngineerApprovalAll(this.request.ncnumber.toString(), lotsL)
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.request.lots[i].id) &&
                  this.request.lots[i].disposition === 'E' &&
                  this.request.lots[i].problemType === 0
                ) {
                  const { rescreen1, rescreen2, rescreen3 } = this.request.lots[i];
                  const retest: boolean =
                    this.dropdown.isRetest(rescreen1.toString()) ||
                    this.dropdown.isRetest(rescreen2.toString()) ||
                    this.dropdown.isRetest(rescreen3.toString());
                  this.request.lots[i].disposition = retest ? 'Y' : 'Z';
                  this.request.lots[i].selected = false;
                }
              }
              for (let i = 0; i < this.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.lots.getRawValue()[i].id) &&
                  this.lots.at(i).get('id').value > -1 &&
                  this.lots.at(i).get('disposition').value === 'E' &&
                  this.lots.at(i).get('problemType').value === 0
                ) {
                  const { rescreen1, rescreen2, rescreen3 } = this.lots.getRawValue()[i];
                  const retest: boolean =
                    this.dropdown.isRetest(rescreen1.toString()) ||
                    this.dropdown.isRetest(rescreen2.toString()) ||
                    this.dropdown.isRetest(rescreen3.toString());
                  this.lots
                    .at(i)
                    .get('disposition')
                    .patchValue({
                      disposition: retest ? 'Y' : 'Z',
                      selected: false
                    });
                }
              }
              this.onChange();
              alertSuccess(
                `<p>Submitted form D3 (Lot Disposition) All Lot !</p>
                  <span style="color: green; white-space: pre-line;">Submit completed, waiting for approval from approval board !</span>`,
                'Successful!',
                () => {
                  this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // On Crashed
            console.error('D3 Lots (PemQa All) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  onEngineerScrapAll(): void {
    // finding last groupName
    let lastGroupName = 0;
    for (let i = 0; i < this.lots.length; i++) {
      const groupName = this.lots.at(i).get('groupName').value;
      if (lastGroupName < parseInt(groupName, 10)) {
        lastGroupName = parseInt(groupName, 10);
      }
    }
    lastGroupName++;

    this.formInSubmit = true;
    this.lots = this.formIn.get('lots') as FormArray;
    let valid: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      if (
        this.lots.at(i).get('id').value > -1 &&
        this.lots.at(i).get('problemType').value === 0 &&
        this.lots.at(i).get('disposition').value === 'E' &&
        this.lots.at(i).get('selected').value
      ) {
        this.lots
          .at(i)
          .get('submit')
          .patchValue(true);
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(true);
        }
        if (this.lots.at(i).invalid) {
          valid = false;
        }
      } else {
        for (let j = 1; j <= 3; j++) {
          this.lots
            .at(i)
            .get(`submit${j}`)
            .patchValue(false);
        }
        this.lots
          .at(i)
          .get(`selected`)
          .patchValue(false);
      }
    }
    if (valid) {
      alertConfirm('Make sure, you will submit disposition all lot.', 'Are you sure ?', async result => {
        if (result.value) {
          this.processing = true;
          try {
            const lotsL = this.lots
              .getRawValue()
              .filter(obj => obj.selected === true && obj.disposition === 'E' && obj.problemType === 0);
            for (let i = 0; i < lotsL.length; i++) {
              lotsL[i].userName = this.user.username;
              lotsL[i].groupName = lastGroupName;
            }
            const response: ResponseObj = await this.ajax
              .getEngineerScrapAll(this.request.ncnumber.toString(), lotsL)
              .toPromise();
            if (response.status === 200 && response.data) {
              for (let i = 0; i < this.request.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.request.lots[i].id) &&
                  this.request.lots[i].disposition === 'E' &&
                  this.request.lots[i].problemType === 0
                ) {
                  this.request.lots[i].disposition = 'F';
                  this.request.lots[i].dispositionType = 1;
                  this.request.lots[i].selected = false;
                }
              }
              for (let i = 0; i < this.lots.length; i++) {
                if (
                  this.hasLot(lotsL, this.lots.getRawValue()[i].id) &&
                  this.lots.at(i).get('disposition').value === 'E' &&
                  this.lots.at(i).get('problemType').value === 0
                ) {
                  this.lots
                    .at(i)
                    .get('disposition')
                    .patchValue({
                      disposition: 'F',
                      dispositionType: 1,
                      selected: false
                    });
                }
              }
              this.onChange();
              alertSuccess(
                `<p>Submitted form D3 (Lot Disposition) All Lot !</p>
                  <span style="color: green; white-space: pre-line;">Submit completed, waiting for approval from approval board !</span>`,
                'Successful!',
                () => {
                  window.location.reload();
                  // this.store.dispatch(setrequest(this.request));
                  // this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // On Crashed
            console.error('D3 Lots (Scrap All) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  public onToggleChk(): void {
    this.chkAll = !this.chkAll;
    for (let i = 0; i < this.lots.length; i++) {
      if (this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
        this.lots.at(i).patchValue({ selected: this.chkAll });
      }
    }
  }

  public onToggleGroup(idx, evt): void {
    if (typeof evt === 'object') {
      const lot = this.lots.getRawValue()[idx];
      for (let i = 0; i < this.lots.length; i++) {
        if (
          this.lots.at(i) &&
          lot.groupName === this.lots.at(i).get('groupName').value &&
          !this.lots.at(i).get('selected').disabled
        ) {
          this.lots.at(i).patchValue({ selected: evt.target.checked });
        }
      }

      // Checking All
      this.onCheckAll();
    }
  }

  public onChk(idx): void {
    // Checking Group
    const { groupName } = this.lots.getRawValue()[idx];
    let chkGroup: boolean = true;
    const headGroup: number = this.lots.getRawValue().findIndex(obj => obj.id === -1 && obj.groupName === groupName);
    for (let i = 0; i < this.lots.length; i++) {
      const lot = this.lots.getRawValue()[i];
      if (lot.id > -1 && lot.groupName === groupName && this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
        if (!this.lots.at(i).get('selected').value) {
          chkGroup = false;
        }
      }
    }
    this.lots
      .at(headGroup)
      .get('selected')
      .patchValue(chkGroup);

    // Checking All
    this.onCheckAll();
  }

  private onCheckAll(): void {
    let chkAll: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      if (this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
        if (!this.lots.at(i).get('selected').value) {
          chkAll = false;
        }
      }
    }

    this.chkAll = chkAll;
    this.formIn.get('selectedCheck').patchValue(chkAll);
  }

  public onReScreenChange(idx: number, control: string) {
    const lastChar: string = control[control.length - 1];
    const lastNum: number = parseInt(lastChar, 10);
    const nextNum: number = lastNum + 1;
    if (lastNum !== 3) {
      const rescreen: number = this.lots.at(idx).get(`rescreen${lastChar}`).value;
      const result: string = this.lots.at(idx).get(`result${lastChar}`).value;
      if (this.lots.at(idx).get(`problemType`).value === 0 && this.lots.at(idx).get(`rescreen${lastChar}`).value) {
        this.lots
          .at(idx)
          .get(`result${lastNum}`)
          .setValidators([Validators.required]);
      } else {
        this.lots
          .at(idx)
          .get(`result${lastNum}`)
          .clearValidators();
      }
      if (rescreen && result) {
        this.lots
          .at(idx)
          .get(`rescreen${nextNum}`)
          .enable();
        this.lots
          .at(idx)
          .get(`result${nextNum}`)
          .enable();
      } else {
        if (this.lots.at(idx).get(`rescreen${nextNum + 1}`)) {
          this.lots
            .at(idx)
            .get(`rescreen${nextNum + 1}`)
            .patchValue('');
          this.lots
            .at(idx)
            .get(`result${nextNum + 1}`)
            .patchValue('');
          this.lots
            .at(idx)
            .get(`rescreen${nextNum + 1}`)
            .disable();
          this.lots
            .at(idx)
            .get(`result${nextNum + 1}`)
            .disable();
        }
        this.lots
          .at(idx)
          .get(`rescreen${nextNum}`)
          .patchValue('');
        this.lots
          .at(idx)
          .get(`result${nextNum}`)
          .patchValue('');
        this.lots
          .at(idx)
          .get(`rescreen${nextNum}`)
          .disable();
        this.lots
          .at(idx)
          .get(`result${nextNum}`)
          .disable();
      }
    }
  }

  /* Select Process */
  private onMaterial(): void {
    const inControls = [
      { name: 'lotId', required: true, value: '' },
      { name: 'problemType', required: true, value: 0, disabled: true },
      { name: 'sampleSize', required: true, value: '' },
      { name: 'rejectQty', required: true, value: '' },
      { name: 'safeLaunch', required: true, value: '' },
      { name: 'mass', required: false, value: '' },
      { name: 'selectedCheck', required: false, value: '', disabled: this.isSelectedDisabled }
    ];
    this.addControls(inControls, 'formIn');
    this.formIn.addControl('lots', this.fb.array([]));
    this.lots = this.formIn.get('lots') as FormArray;
  }
  private onInProcess(): void {
    const inControls = [
      { name: 'lotId', required: true, value: '' },
      { name: 'problemType', required: true, value: 0, disabled: true },
      { name: 'sampleSize', required: true, value: '' },
      { name: 'osReject', required: false, value: '' },
      { name: 'paraQty', required: false, value: '' },
      { name: 'rejectQty', required: true, value: '' },
      { name: 'safeLaunch', required: true, value: '' },
      { name: 'mass', required: false, value: '' },
      { name: 'selectedCheck', required: false, value: '', disabled: this.isSelectedDisabled }
    ];
    this.addControls(inControls, 'formIn');
    this.formIn.addControl('lots', this.fb.array([]));
    this.lots = this.formIn.get('lots') as FormArray;
  }
  private onPreviousProcess(): void {
    const inControls = [
      { name: 'lotId', required: true, value: '' },
      { name: 'problemType', required: true, value: 0, disabled: true },
      { name: 'sampleSize', required: true, value: '' },
      { name: 'osReject', required: true, value: '' },
      { name: 'paraQty', required: true, value: '' },
      { name: 'rejectQty', required: true, value: '' },
      { name: 'safeLaunch', required: true, value: '' },
      { name: 'mass', required: false, value: '' },
      { name: 'selectedCheck', required: false, value: '', disabled: this.isSelectedDisabled }
    ];
    this.addControls(inControls, 'formIn');
    this.formIn.addControl('lots', this.fb.array([]));
    this.lots = this.formIn.get('lots') as FormArray;
  }
  onOnHold(): void {
    this.onRemove(); // remove controls
  }
  onRemove(form: string = 'form'): void {
    const controls = [
      /* section 2 */
      { name: 'lotId', section: 'formIn' },
      { name: 'problemType', section: 'formIn' },
      { name: 'sampleSize', section: 'formIn' },
      { name: 'osReject', section: 'formIn' },
      { name: 'paraQty', section: 'formIn' },
      { name: 'rejectQty', section: 'formIn' },
      { name: 'safeLaunch', section: 'formIn' },
      { name: 'mass', section: 'formIn' },
      { name: 'lots', section: 'formIn' },
      { name: 'selectedCheck', section: 'formIn' }
      /* section 2 */
    ];
    this.lots = this.fb.array([]);
    this.removeControls(controls, form);
  }
  /* Select Process */

  /* Controls Management */
  addControls(controls: any[], form: string = 'form'): void {
    this.onRemove(form); // remove in controls
    for (let i = 0; i < controls.length; i++) {
      this.addControl(form, controls[i].name, controls[i].required, controls[i].value, controls[i].disabled);
    }
  }
  removeControls(controls: any[], form: string): void {
    if (this[form]) {
      for (let i = 0; i < controls.length; i++) {
        if (this[form].get(controls[i].name) && controls[i].section === form) {
          this[form].removeControl(controls[i].name);
        }
      }
    } else {
      this[form] = this.fb.group({});
    }
  }
  addControl(
    form: string,
    control: string,
    required: boolean = true,
    value: any = '',
    disabled: boolean = false,
    optional?: ValidatorFn | ValidatorFn[] | AbstractControlOptions
  ): void {
    let option: ValidatorFn | ValidatorFn[] | AbstractControlOptions = required ? Validators.required : null;
    if (optional) {
      option = optional;
    }
    this[form].addControl(control, this.fb.control({ value, disabled }, option));
  }
  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  validateOperation() {
    alertWarning('Please select operation..');
  }
  /* Controls Management */

  private enableLot(i: number, j: number, problem: boolean) {
    /* prettier-ignore */
    if (problem) {
      // this.lots.at(i).get(`rescreen${j}`).enable();
      this.lots.at(i).get(`result${j}`).disable();
      // this.lots.at(i).get(`rescreen${j}`).setValidators([Validators.required]);
      this.lots.at(i).get(`result${j}`).setValidators([Validators.required]);
    } else {
      // this.lots.at(i).get(`rescreen${j}`).enable();
      this.lots.at(i).get(`result${j}`).disable();
      // this.lots.at(i).get(`rescreen${j}`).clearValidators();
      this.lots.at(i).get(`result${j}`).clearValidators();
    }
    /* prettier-ignore */
    this.lots.at(i).get(`selected`).enable();
    /* prettier-ignore */
    this.lots.at(i).get(`selected`).clearValidators();
    /* prettier-ignore */
    this.lots.at(i).get(`selected`).updateValueAndValidity();
    /* prettier-ignore */
    this.lots.at(i).get(`rescreen${j}`).updateValueAndValidity();
    /* prettier-ignore */
    this.lots.at(i).get(`result${j}`).updateValueAndValidity();
    /* prettier-ignore */
  }

  private disableLot(i: number, j: number) {
    /* prettier-ignore */
    this.lots.at(i).get(`rescreen${j}`).disable();
    /* prettier-ignore */
    this.lots.at(i).get(`result${j}`).disable();
    /* prettier-ignore */
    this.lots.at(i).get(`fuByQa${j}`).disable();
    /* prettier-ignore */
    this.lots.at(i).get(`rescreen${j}`).setValidators([Validators.required]);
    /* prettier-ignore */
    this.lots.at(i).get(`result${j}`).setValidators([Validators.required]);
    /* prettier-ignore */
    this.lots.at(i).get(`fuByQa${j}`).setValidators([Validators.required]);
    /* prettier-ignore */
    this.lots.at(i).get(`rescreen${j}`).clearValidators();
    /* prettier-ignore */
    this.lots.at(i).get(`result${j}`).clearValidators();
    /* prettier-ignore */
    this.lots.at(i).get(`fuByQa${j}`).clearValidators();
    /* prettier-ignore */
    this.lots.at(i).get(`rescreen${j}`).updateValueAndValidity();
    /* prettier-ignore */
    this.lots.at(i).get(`result${j}`).updateValueAndValidity();
    /* prettier-ignore */
    this.lots.at(i).get(`fuByQa${j}`).updateValueAndValidity();
    /* prettier-ignore */
  }

  public getStatus(disposition: string, problem?: number): string {
    /**
     * Status priorities
     * 1) N (No Instruction), F(Finance and Waiting for approve), W (Waiting for approve)
     * 2) I (Added Instruction), R (Reject from disposition)
     * 3) P (Pending Waiting for PEMQA or FUQA)
     * 4) E (Waiting for engineer approve) [Only Problem Lot]
     * 5) Y (Waiting for MTE) [Only Re-Test Lot]
     * 6) Z (Completed), S (Completed with scrap), H (Completed with hold)
     */
    switch (disposition) {
      case 'S':
        return 'Completed';
      case 'Y':
        return 'Waiting for MTE';
      case 'Z':
        return 'Completed';
      case 'H':
        return 'Hold';
      case 'R':
        return 'Rejected';
      case 'I':
        return 'Pending';
      case 'P':
        if (problem === 0) {
          return 'Waiting for FU QA';
        } else {
          return 'Waiting for complete all result';
        }
      case 'E':
        return 'Waiting for PE MQA';
      case 'N':
        return 'Pending';
      case 'F':
        return 'Pending';
      case 'W':
        return 'Pending';
      default:
        return 'Pending';
    }
  }

  async downloadFile(idx: number) {
    const attachFile = this.lots.getRawValue()[idx].attach;
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'D3 File View NCRB',
        folders: [this.request.id.toString(), 'D3'],
        fileid: attachFile.id,
        filename: attachFile.fileName,
        filenames: attachFile.fileName?.split('.').join(',') || 'Not Found,html'
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      try {
        this.loading = true;
      } catch (ex) {
        console.error('Download File : ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  public getStatusHist(disposition: string, problem?: number): string {
    switch (disposition) {
      case 'P':
        if (problem === 0) {
          return 'Reject from FU QA';
        } else {
          return 'Reject from PE MQA';
        }
      case 'E':
        return 'Reject from Engineer';
      default:
        return 'Reject from unknown';
    }
  }

  public rescreen(res): string {
    const ress = this.reScreens.find(obj => obj.value.toString() === res.toString());
    if (ress) {
      return ress.label;
    }
    return 'NONE';
  }

  private hasLot(lots: any[], id: number): boolean {
    return lots.findIndex(obj => obj.id === id) > -1;
  }

  private requiredLotValidator(idx: number, controlName: string): void {
    this.lots
      .at(idx)
      .get(controlName)
      .enable();
    this.lots
      .at(idx)
      .get(controlName)
      .setValidators([Validators.required]);
    this.lots
      .at(idx)
      .get(controlName)
      .updateValueAndValidity();
  }

  private clearLotValidator(idx: number, controlName: string, disabled: boolean = false): void {
    if (disabled) {
      this.lots
        .at(idx)
        .get(controlName)
        .disable();
    }
    this.lots
      .at(idx)
      .get(controlName)
      .clearValidators();
    this.lots
      .at(idx)
      .get(controlName)
      .updateValueAndValidity();
  }

  get isDispositionAll() {
    let fact: boolean = true;
    for (let i = 0; i < this.request.lots.length; i++) {
      const { disposition } = this.request.lots[i];
      if (disposition === 'I' || disposition === 'R') {
        fact = false;
      }
    }
    return fact;
  }

  get isPemQaApproveAll() {
    let fact: boolean = true;
    for (let i = 0; i < this.request.lots.length; i++) {
      const { disposition } = this.request.lots[i];
      if (this.request.lots[i].problemType !== 0 && disposition !== 'Y') {
        fact = false;
      }
    }
    return fact;
  }

  get isFuQaApproveAll() {
    let fact: boolean = true;
    for (let i = 0; i < this.request.lots.length; i++) {
      const { disposition } = this.request.lots[i];
      if (this.request.lots[i].problemType === 0 && disposition !== 'Y' && disposition !== 'E') {
        fact = false;
      }
    }
    return fact;
  }

  get isApproveAll() {
    let fact: boolean = true;
    for (let i = 0; i < this.request.lots.length; i++) {
      const { disposition } = this.request.lots[i];
      if (
        disposition === 'I' ||
        disposition === 'P' ||
        disposition === 'R' ||
        disposition === 'Y' ||
        disposition === 'E'
      ) {
        fact = false;
      }
    }
    return fact && this.request.lots.filter(o => o.disposition !== 'N').length > 0;
  }

  get countSelected(): number {
    return this.lots
      .getRawValue()
      .filter(obj => obj.selected === true && (obj.disposition === 'I' || obj.disposition === 'R')).length;
  }

  get countFuQaSelected(): number {
    return this.lots
      .getRawValue()
      .filter(obj => obj.selected === true && obj.problemType === 0 && obj.disposition === 'P').length;
  }

  get countPemQaSelected(): number {
    return this.lots
      .getRawValue()
      .filter(obj => obj.selected === true && obj.problemType !== 0 && obj.disposition === 'P').length;
  }

  get countEngineerSelected(): number {
    return this.lots
      .getRawValue()
      .filter(obj => obj.selected === true && obj.problemType === 0 && obj.disposition === 'E').length;
  }

  get countMteSelected(): number {
    return this.lots.getRawValue().filter(obj => obj.selected === true && obj.disposition === 'Y').length;
  }

  get hasPemqaLot(): boolean {
    return this.lots.getRawValue().filter(obj => obj.disposition === 'P' && obj.problemType !== 0).length > 0;
  }

  get hasFuqaLot(): boolean {
    return this.lots.getRawValue().filter(obj => obj.disposition === 'P' && obj.problemType === 0).length > 0;
  }

  get hasEngineerLot(): boolean {
    return this.lots.getRawValue().filter(obj => obj.disposition === 'E' && obj.problemType === 0).length > 0;
  }

  get hasMteLot(): boolean {
    return this.lots.getRawValue().filter(obj => obj.disposition === 'Y').length > 0;
  }

  get isSelectedDisabled(): boolean {
    let disabled: boolean = true;
    if (this.lots) {
      for (let i = 0; i < this.lots.length; i++) {
        if (this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
          disabled = false;
        }
      }
    }
    return (this.lots && this.lots.length === 0) || disabled;
  }

  get countRescreenHistory(): number {
    return this.histLots.length;
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_5').value : 'Loading';
  }

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }

  has3HistLots(): boolean {
    let fact: boolean = false;
    if (this.histLots.length > 0) {
      const lots: any[] = this.lots.getRawValue();
      for (let i = 0; i < lots.length; i++) {
        lots[i] = { ...lots[i], ...{ count: 0 } };
      }
      for (let i = 0; i < this.histLots.length; i++) {
        const idx: number = lots.findIndex(o => o.lotId === this.histLots[i].lotId);
        if (idx > 0) {
          lots[idx].count += 1;
        }
      }
      fact = lots.filter(o => o.count >= 3).length > 0;
    }
    return fact;
  }
}
