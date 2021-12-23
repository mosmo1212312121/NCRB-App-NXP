import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BaseComponent, NxpSelection } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { Initial, IStatus, Lot, ResponseObj, Score, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService, MockService } from '../../../services';
import { setrequest, setscore, setscoreold } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertWarning, filterByName } from '../../../utils';

@Component({
  selector: 'app-d2-lot-engineer',
  templateUrl: 'd2-lot-engineer.component.html'
})
export class D2LotEngineerComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  formIn: FormGroup;
  form: FormGroup;
  lots: FormArray;
  allSlices: FormArray[] = [];
  materials: FormArray;
  lotsRemove: number[] = [];
  materialsRemove: number[] = [];
  operations: NxpSelection[] = [];
  isCollapsedSlices: boolean[] = [];
  submit: boolean = false;
  formInSubmit: boolean = false;
  typeName: string = '';
  id: number = null;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  iStatusSub: any = null;
  status: Status = new Status();
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  ownerFilter = filterByName;
  testerClickIdx: number = -1;

  isAcknowledge: boolean = false;
  isDraft: boolean = false;
  isFinal: boolean = false;
  isInProcess: boolean = false;
  isMaterial: boolean = false;
  isOnHold: boolean = false;
  isOwner: boolean = false;
  isPreviousProcess: boolean = false;
  isRequest: boolean = false;
  isRequestor: boolean = false;
  isSubmit: boolean = false;
  isWafer: boolean = false;
  isMember: boolean = false;
  notFinalAndWafer: boolean = false;
  lotIsChange: boolean = false;
  isEditingBy: boolean = false;
  chkAll: boolean = false;

  loading: boolean = false;
  processing: boolean = false;

  problemType: number = -1;
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dropdown: DropdownService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d2-lot-engineer');

    this.form = this.fb.group({});
    this.formIn = this.fb.group({});
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId') {
        this.user = user;
      } else {
        this.user = null;
      }
    });
    this.iStatusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      // status.isD12D3;
      // status.isD12D8;
      // status.isD12D83x5Why;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe(async (request: Initial) => {
      try {
        // this.loading = true;
        this.request = request;
        this.submit = this.request.submit;
        this.isOwner = this.request.isOwner;
        this.isInProcess = this.request.isInProcess;
        this.isMaterial = this.request.isMaterial;
        this.isPreviousProcess = this.request.isPreviousProcess;
        this.isOnHold = this.request.isOnHold;
        this.notFinalAndWafer = this.request.notFinalAndWafer;
        this.isFinal = this.request.isFinal;
        this.isWafer = this.request.isWafer;
        this.isAcknowledge = this.request.isAcknowledge;
        this.isRequest = this.request.isRequest;
        this.isRequestor = this.request.isRequestor;
        this.isDraft = this.request.isDraft;
        this.isSubmit = this.request.isSubmit;
        this.isMember = this.request.isMember;
        this.isEditingBy = this.request.isEditingBy;
        this.form = this.fb.group({
          operation: [{ value: this.request.operation, disabled: false }]
        });
        if (this.request.problemType !== this.problemType) {
          this.problemType = this.request.problemType;
          this.onTypeChange(this.problemType);
        }
        this.lots = this.formIn.get('lots') as FormArray;
        this.clearFormArray(this.lots);
        this.isCollapsedSlices = [];
        for (let i = 0; i < this.request.lots.length; i++) {
          // toggle view
          this.isCollapsedSlices.push(true);
          if (i === 0 && !this.request.workflow) {
            this.request.lotMaster = this.request.lots[i].lotId;
            this.request.workflow = this.request.lots[i].workflow;
          }
          const lot = this.request.lots[i];
          this.lots.push(
            this.fb.group({
              selectedLot: [{ value: false, disabled: false }],
              id: [lot.id],
              seq: this.lots.controls.length + 1,
              sampleSize: lot.sampleSize,
              osReject: lot.osReject,
              paraQty: lot.paraQty,
              safeLaunch: lot.safeLaunch,
              product12nc: [{ value: lot.product12nc, disabled: true }],
              assyCg: [{ value: lot.assyCg, disabled: true }],
              blName: [{ value: lot.blName, disabled: true }],
              currentOpt: [{ value: lot.currentOpt, disabled: true }],
              dateCode: [{ value: lot.dateCode, disabled: true }],
              lotId: [{ value: lot.lotId, disabled: true }],
              machine: [{ value: lot.machine, disabled: true }],
              handler: [{ value: lot.handler, disabled: true }],
              productDesc: [{ value: lot.productDesc, disabled: true }],
              quantity: [{ value: lot.quantity, disabled: true }, Validators.min(0)],
              rejectQty: [{ value: lot.rejectQty, disabled: false }, Validators.min(0)],
              problemType: [{ value: lot.problemType || 0, disabled: true }], // default `problem` and status `disabled`
              waferBatch: [{ value: lot.waferBatch, disabled: true }],
              waferSlice: [{ value: lot.waferSlice, disabled: true }],
              waferSlices: this.fb.array([]),
              workflow: [{ value: lot.workflow, disabled: false }],
              disposition: [lot.disposition],
              rescreen1: [lot.rescreen1],
              rescreen2: [lot.rescreen2],
              rescreen3: [lot.rescreen3],
              result1: [lot.result1],
              result2: [lot.result2],
              result3: [lot.result3],
              fuByQa1: [lot.fuByQa1],
              fuByQa2: [lot.fuByQa2],
              fuByQa3: [lot.fuByQa3],
              dispositionType: [lot.dispositionType]
            })
          );
          const waferSlices: FormArray = this.lots.at(this.lots.length - 1).get('waferSlices') as FormArray;
          if (this.request.lots[i].waferSlices) {
            for (let j = 0; j < this.request.lots[i].waferSlices.length; j++) {
              waferSlices.push(
                this.fb.group({
                  lotId: this.request.lots[i].lotId,
                  ocrId: this.request.lots[i].waferSlices[j].ocrId
                })
              );
            }
          }
        }

        if (this.id !== this.request.id) {
          // On detail page
          this.id = this.request.id;
          this.formIn.updateValueAndValidity();
          this.onChange();
          if (!this.isOwner) {
            this.formIn.disable();
          } else {
            this.formIn.enable();
          }

          this.form.get('operation').reset();
          this.form.get('operation').enable();
          this.form.get('operation').updateValueAndValidity();
          // Operation
          if (this.request.workflow && this.request.lotMaster) {
            this.operations = this.request.operation
              ? [{ id: 999, label: this.request.operation, value: this.request.operation }]
              : [];
            this.processing = true;
            for (let j = 0; j < this.request.lots.length; j++) {
              if (this.request.lots[j].problemType === 0) {
                const resObj: ResponseObj = await this.ajax.getOperations(this.request.lots[j].lotId).toPromise();
                for (let i = 0; i < resObj.data.operations.length; i++) {
                  this.operations.push({
                    id: i + 1,
                    label: resObj.data.operations[i],
                    value: resObj.data.operations[i]
                  });
                }
              }
            }
            this.operations = this.operations.filter((value, index, self) => {
              return self.indexOf(value) === index;
            });
            this.form.get('operation').patchValue(this.request.operation);
            this.processing = false;
          }
        }
        if (
          (this.id &&
            (this.isSubmit ||
              !this.user ||
              (!this.isOwner && (this.isRequest || this.isAcknowledge)) ||
              (this.isDraft && !(this.isRequestor || this.isMember)))) ||
          (this.id && !this.isEditingBy)
        ) {
          this.formIn.disable();
          this.form.disable();
        } else {
          this.formIn.enable();
          this.formIn.get('problemType').disable();
          this.formIn.get('problemType').updateValueAndValidity();
          // if (!this.request.id || !this.id) {
          //   this.form.disable();
          // }
          if (this.isWafer || this.isFinal) {
            this.formIn.get('osReject').setValidators([Validators.required]);
            this.formIn.get('paraQty').setValidators([Validators.required]);
          } else {
            this.formIn.get('osReject').clearValidators();
            this.formIn.get('paraQty').clearValidators();
          }
          this.formIn.get('osReject').updateValueAndValidity();
          this.formIn.get('paraQty').updateValueAndValidity();

          for (let i = 0; i < this.request.lots.length; i++) {
            if (
              this.request.lots[i].problemType === 0 ||
              (this.request.lots[i].id !== 0 && this.request.lots[i].disposition !== 'N')
            ) {
              this.lots
                .at(i)
                .get('problemType')
                .disable();
            } else {
              this.lots
                .at(i)
                .get('problemType')
                .enable();
            }
            this.disableLot(i);
            if (this.request.lots[i].id && this.request.lots[i].disposition !== 'N') {
              this.lots.at(i).disable();
            }
          }
        }
      } catch (ex) {
        console.error('D2 Lot (Prepare data) Errors: ', ex);
        setTimeout(() => {
          this.form.get('operation').patchValue(this.request.operation);
          this.processing = false;
        }, 200);
      } finally {
        // this.loading = false;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.iStatusSub.unsubscribe();
  }

  onTypeChange(event: number): void {
    if (event && typeof event !== 'object') {
      switch (parseInt(event.toString(), 10)) {
        // case 1: // In Process
        //   this.typeName = 'In-process';
        //   // this.onInProcess();
        //   this.onPreviousProcess();
        //   break;
        case 2: // Previous Process
          this.typeName = 'Feedback from previous process';
          break;
        case 3: // Material
          this.typeName = 'Material';
          break;
        case 4: // On Hold
          this.typeName = 'On Hold';
          break;
        default:
          this.typeName = 'In-process';
          break;
      }
    } else {
      this.typeName = 'In-process';
    }
    this.onPreviousProcess();
  }

  onToggleChk() {
    this.chkAll = !this.chkAll;
    for (let i = 0; i < this.lots.length; i++) {
      if (this.lots.at(i) && !this.lots.at(i).get('selectedLot').disabled) {
        this.request.lots[i].selectedLot = this.chkAll;
        this.lots.at(i).patchValue({ selectedLot: this.chkAll });
      }
    }
  }

  onProberClick(idx: number) {
    this.request = Object.assign(this.request, { submit: true });
    this.store.dispatch(setrequest(this.request));
    if (!this.request.operation) {
      this.validateOperation();
      return;
    }
    alertConfirm('This process will take a long time [Prober].', 'Are you sure ?', async rs => {
      if (rs.value) {
        // TODO
        this.lots = this.formIn.get('lots') as FormArray;
        const lots: Lot[] = this.lots.getRawValue();
        const spec: string = this.request.operation;
        this.loading = true;
        try {
          const response: ResponseObj = await this.ajax
            .getProberOne(lots[idx].lotId, spec, lots[idx].machine)
            .toPromise();
          if (response.status === 200 && response.data) {
            const results: any[] = response.data;
            this.lots = this.formIn.get('lots') as FormArray;
            for (let i = 0; i < results.length; i++) {
              const result: any = results[i];
              const dx: number = this.lots.getRawValue().findIndex(obj => obj.lotId === result.lotId);
              if (dx === -1) {
                this.lots.push(
                  this.fb.group({
                    selectedLot: [false],
                    id: result.id,
                    seq: this.lots.controls.length + 1,
                    product12nc: [{ value: result.product12nc, disabled: true }],
                    assyCg: [{ value: result.assyCg, disabled: true }],
                    blName: [{ value: result.blName, disabled: true }],
                    currentOpt: [{ value: result.currentOpt, disabled: true }],
                    dateCode: [{ value: result.dateCode, disabled: true }],
                    lotId: [{ value: result.lotId, disabled: true }],
                    machine: [{ value: result.machine, disabled: true }],
                    handler: [{ value: result.handler, disabled: true }],
                    productDesc: [{ value: result.productDesc, disabled: true }],
                    quantity: [{ value: result.quantity, disabled: true }, Validators.min(0)],
                    rejectQty: [{ value: result.rejectQty, disabled: true }, Validators.min(0)],
                    problemType: [{ value: result.problemType || 0, disabled: false }], // default `problem` and status `disabled`
                    waferBatch: [{ value: result.waferBatch, disabled: true }],
                    waferSlice: [{ value: result.waferSlice, disabled: true }],
                    workflow: [{ value: result.workflow, disabled: false }],
                    disposition: ['N'],
                    rescreen1: [''],
                    rescreen2: [''],
                    rescreen3: [''],
                    result1: [''],
                    result2: [''],
                    result3: [''],
                    fuByQa1: [''],
                    fuByQa2: [''],
                    fuByQa3: [''],
                    dispositionType: ['']
                  })
                );
              }
            }

            // Update Sequence
            for (let i = 0; i < this.lots.length; i++) {
              this.lots
                .at(i)
                .get('seq')
                .patchValue(i + 1);
            }
            this.request.lots = this.lots.getRawValue();
            const res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
            if (res.status === 200 && res.data) {
              const score: Score = Object.assign({}, res.data);
              this.store.dispatch(setscore(score));
              this.store.dispatch(setscoreold(score));
            }

            this.setrequest();
          }
        } catch (ex) {
          // On Crashed
          console.error('D2 Lot (Prober Click) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onHandlerClick(idx: number) {
    this.request = Object.assign(this.request, { submit: true });
    this.store.dispatch(setrequest(this.request));
    if (!this.request.operation) {
      this.validateOperation();
      return;
    }
    alertConfirm('This process will take a long time [Handler].', 'Are you sure ?', async rs => {
      if (rs.value) {
        // TODO
        this.lots = this.formIn.get('lots') as FormArray;
        const lots: Lot[] = this.lots.getRawValue();
        const spec: string = this.request.operation;
        this.loading = true;
        try {
          const response: ResponseObj = await this.ajax
            .getHandlerOne(lots[idx].lotId, spec, lots[idx].machine)
            .toPromise();
          if (response.status === 200 && response.data) {
            const results: any[] = response.data;
            this.lots = this.formIn.get('lots') as FormArray;
            for (let i = 0; i < results.length; i++) {
              const result: any = results[i];
              const dx: number = this.lots.getRawValue().findIndex(obj => obj.lotId === result.lotId);
              if (dx === -1) {
                this.lots.push(
                  this.fb.group({
                    selectedLot: [false],
                    id: result.id,
                    seq: this.lots.controls.length + 1,
                    product12nc: [{ value: result.product12nc, disabled: true }],
                    assyCg: [{ value: result.assyCg, disabled: true }],
                    blName: [{ value: result.blName, disabled: true }],
                    currentOpt: [{ value: result.currentOpt, disabled: true }],
                    dateCode: [{ value: result.dateCode, disabled: true }],
                    lotId: [{ value: result.lotId, disabled: true }],
                    machine: [{ value: result.machine, disabled: true }],
                    handler: [{ value: result.handler, disabled: true }],
                    productDesc: [{ value: result.productDesc, disabled: true }],
                    quantity: [{ value: result.quantity, disabled: true }, Validators.min(0)],
                    rejectQty: [{ value: result.rejectQty, disabled: true }, Validators.min(0)],
                    problemType: [{ value: result.problemType || 0, disabled: false }], // default `problem` and status `disabled`
                    waferBatch: [{ value: result.waferBatch, disabled: true }],
                    waferSlice: [{ value: result.waferSlice, disabled: true }],
                    workflow: [{ value: result.workflow, disabled: false }],
                    disposition: ['N'],
                    rescreen1: [''],
                    rescreen2: [''],
                    rescreen3: [''],
                    result1: [''],
                    result2: [''],
                    result3: [''],
                    fuByQa1: [''],
                    fuByQa2: [''],
                    fuByQa3: [''],
                    dispositionType: ['']
                  })
                );
              }
            }

            // Update Sequence
            for (let i = 0; i < this.lots.length; i++) {
              this.lots
                .at(i)
                .get('seq')
                .patchValue(i + 1);
            }

            this.request.lots = this.lots.getRawValue();
            const res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
            if (res.status === 200 && res.data) {
              const score: Score = Object.assign({}, res.data);
              this.store.dispatch(setscore(score));
              this.store.dispatch(setscoreold(score));
            }
            this.setrequest();
          }
        } catch (ex) {
          // On Crashed
          console.error('D2 Lot (Handler Click) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onTesterOneClick(idx: number) {
    this.request = Object.assign(this.request, { submit: true });
    this.store.dispatch(setrequest(this.request));
    if (!this.request.operation) {
      this.validateOperation();
      return;
    }
    alertConfirm('This process will take a long time.', 'Are you sure ?', async rs => {
      if (rs.value) {
        this.lots = this.formIn.get('lots') as FormArray;
        const lots: Lot[] = this.lots.getRawValue();
        const spec: string = this.request.operation;
        try {
          this.loading = true;
          const response: ResponseObj = await this.ajax.getTesterOne(lots[idx].lotId, spec).toPromise();
          if (response.status === 200 && response.data) {
            const results: any[] = response.data;
            this.lots = this.formIn.get('lots') as FormArray;
            for (let i = 0; i < results.length; i++) {
              const result: any = results[i];
              const dx: number = this.lots.getRawValue().findIndex(obj => obj.lotId === result.lotId);
              if (dx === -1) {
                this.lots.push(
                  this.fb.group({
                    selectedLot: [false],
                    id: result.id,
                    seq: this.lots.controls.length + 1,
                    product12nc: [{ value: result.product12nc, disabled: true }],
                    assyCg: [{ value: result.assyCg, disabled: true }],
                    blName: [{ value: result.blName, disabled: true }],
                    currentOpt: [{ value: result.currentOpt, disabled: true }],
                    dateCode: [{ value: result.dateCode, disabled: true }],
                    lotId: [{ value: result.lotId, disabled: true }],
                    machine: [{ value: result.machine, disabled: true }],
                    handler: [{ value: result.handler, disabled: true }],
                    productDesc: [{ value: result.productDesc, disabled: true }],
                    quantity: [{ value: result.quantity, disabled: true }, Validators.min(0)],
                    rejectQty: [{ value: result.rejectQty, disabled: true }, Validators.min(0)],
                    osReject: [{ value: result.osReject, disabled: false }],
                    paraQty: [{ value: result.paraQty, disabled: false }],
                    problemType: [{ value: result.problemType || 0, disabled: false }], // default `problem` and status `disabled`
                    waferBatch: [{ value: result.waferBatch, disabled: true }],
                    waferSlice: [{ value: result.waferSlice, disabled: true }],
                    waferSlices: this.fb.array([]),
                    workflow: [{ value: result.workflow, disabled: false }],
                    disposition: ['N'],
                    rescreen1: [''],
                    rescreen2: [''],
                    rescreen3: [''],
                    result1: [''],
                    result2: [''],
                    result3: [''],
                    fuByQa1: [''],
                    fuByQa2: [''],
                    fuByQa3: [''],
                    dispositionType: ['']
                  })
                );
                const waferSlices: FormArray = this.lots.at(this.lots.length - 1).get('waferSlices') as FormArray;
                if (result.waferSlices) {
                  for (let j = 0; j < result.waferSlices.length; j++) {
                    waferSlices.push(
                      this.fb.group({
                        lotId: result.lotId,
                        ocrId: result.waferSlices[j].ocrId
                      })
                    );
                  }
                }
              }
            }

            // Update Sequence
            for (let i = 0; i < this.lots.length; i++) {
              this.lots
                .at(i)
                .get('seq')
                .patchValue(i + 1);
            }

            this.request.lots = this.lots.getRawValue();
            const res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
            if (res.status === 200 && res.data) {
              const score: Score = Object.assign({}, res.data);
              this.store.dispatch(setscore(score));
              this.store.dispatch(setscoreold(score));
            }

            this.setrequest();
          }
        } catch (ex) {
          // on crashed
          console.error('D2 Lot (Tester Click) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onUpdateLots() {
    alertConfirm('Please check your lots before save.', 'Are you sure ?', async rs => {
      if (rs) {
        try {
          const response: ResponseObj = await this.ajax
            .updateLots(this.request.ncnumber, this.lots.getRawValue(), this.lotsRemove, this.request.operation)
            .toPromise();
          if (response.status === 200) {
            this.lots = this.formIn.get('lots') as FormArray;
            this.clearFormArray(this.lots);
            for (let i = 0; i < response.data.lots.length; i++) {
              const result: Lot = response.data.lots[i];
              const dp: boolean = result.disposition === 'N' ? false : true;
              this.lots.push(
                this.fb.group({
                  selectedLot: [false],
                  id: result.id,
                  seq: this.lots.controls.length + 1,
                  product12nc: [{ value: result.product12nc, disabled: dp }],
                  assyCg: [{ value: result.assyCg, disabled: dp }],
                  blName: [{ value: result.blName, disabled: dp }],
                  currentOpt: [{ value: result.currentOpt, disabled: dp }],
                  dateCode: [{ value: result.dateCode, disabled: true }],
                  lotId: [{ value: result.lotId, disabled: true }],
                  machine: [{ value: result.machine, disabled: dp }],
                  handler: [{ value: result.handler, disabled: dp }],
                  productDesc: [{ value: result.productDesc, disabled: dp }],
                  quantity: [{ value: result.quantity, disabled: dp }, Validators.min(0)],
                  rejectQty: [{ value: result.rejectQty, disabled: dp }, Validators.min(0)],
                  osReject: [{ value: result.osReject, disabled: dp }],
                  paraQty: [{ value: result.paraQty, disabled: dp }],
                  problemType: [
                    { value: result.problemType || 0, disabled: result.problemType === 0 || dp ? true : false }
                  ], // default `problem` and status `disabled`
                  waferBatch: [{ value: result.waferBatch, disabled: dp }],
                  waferSlice: [{ value: result.waferSlice, disabled: dp }],
                  waferSlices: this.fb.array([]),
                  workflow: [{ value: result.workflow, disabled: dp }],
                  disposition: [{ value: result.disposition, disabled: dp }],
                  rescreen1: [{ value: result.rescreen1, disabled: dp }],
                  rescreen2: [{ value: result.rescreen2, disabled: dp }],
                  rescreen3: [{ value: result.rescreen3, disabled: dp }],
                  result1: [{ value: result.result1, disabled: dp }],
                  result2: [{ value: result.result2, disabled: dp }],
                  result3: [{ value: result.result3, disabled: dp }],
                  fuByQa1: [{ value: result.fuByQa1, disabled: dp }],
                  fuByQa2: [{ value: result.fuByQa2, disabled: dp }],
                  fuByQa3: [{ value: result.fuByQa3, disabled: dp }],
                  dispositionType: [{ value: result.dispositionType, disabled: dp }]
                })
              );
              const waferSlices: FormArray = this.lots.at(this.lots.length - 1).get('waferSlices') as FormArray;
              if (this.request.lots[i].waferSlices) {
                for (let j = 0; j < result.waferSlices.length; j++) {
                  waferSlices.push(
                    this.fb.group({
                      lotId: result.lotId,
                      ocrId: result.waferSlices[j].ocrId
                    })
                  );
                }
              }
              this.disableLot(i);
            }
            this.lotIsChange = false;
          }
        } catch (ex) {
          console.error('D2 Lot (Update Lots) Errors: ', ex);
        }
      }
    });
  }

  /* Forms Event */
  async addLot(problem: string = '') {
    this.formInSubmit = true;
    if (this.formIn.valid) {
      /* Prepare data */
      this.formInSubmit = false;
      const lotName: string = this.formIn.get('lotId').value;
      this.lots = this.formIn.get('lots') as FormArray;
      const data = this.formIn.getRawValue();
      const saveLots = this.formIn.getRawValue().lots;

      // check if exist
      const index: number = this.lots.getRawValue().findIndex((obj: Lot) => data.lotId === obj.lotId);
      if (index > -1) {
        alertWarning(
          `<p>Please try again..</p>
        <span style="color: red; white-space: pre-line;">The lot already existed.</span>`,
          'Warning!'
        );
        return;
      }

      // Update formIn
      this.formIn.reset();
      this.formIn.get('problemType').patchValue(0);
      this.formIn.get('lots').patchValue(saveLots);

      /* Prepare data */
      this.processing = true;

      // Not Material
      try {
        const response: ResponseObj = await this.ajax.getLotInfo(lotName).toPromise();
        if (response.status === 200) {
          const result = response.data as Lot;
          this.isCollapsedSlices.push(true);
          this.lots.push(
            this.fb.group({
              selectedLot: [false],
              id: [result.id],
              seq: this.lots.controls.length + 1,
              sampleSize: data.sampleSize,
              osReject: data.osReject,
              paraQty: data.paraQty,
              safeLaunch: data.safeLaunch,
              product12nc: [{ value: result.product12nc, disabled: true }],
              assyCg: [{ value: result.assyCg, disabled: true }],
              blName: [{ value: result.blName, disabled: true }],
              currentOpt: [{ value: result.currentOpt, disabled: true }],
              dateCode: [{ value: result.dateCode, disabled: true }],
              lotId: [{ value: result.lotId, disabled: true }],
              machine: [{ value: result.machine, disabled: true }],
              handler: [{ value: result.handler, disabled: true }],
              productDesc: [{ value: result.productDesc, disabled: true }],
              quantity: [{ value: result.quantity, disabled: true }, Validators.min(0)],
              rejectQty: [{ value: data.rejectQty, disabled: false }, Validators.min(0)],
              problemType: [{ value: result.problemType || 0, disabled: true }], // default `problem` and status `disabled`
              waferBatch: [{ value: result.waferBatch, disabled: true }],
              waferSlice: [{ value: result.waferSlice, disabled: true }],
              waferSlices: this.fb.array([]),
              workflow: [{ value: result.workflow, disabled: false }],
              disposition: ['N'],
              rescreen1: [''],
              rescreen2: [''],
              rescreen3: [''],
              result1: [''],
              result2: [''],
              result3: [''],
              fuByQa1: [''],
              fuByQa2: [''],
              fuByQa3: [''],
              dispositionType: ['']
            })
          );
          const waferSlices: FormArray = this.lots.at(this.lots.length - 1).get('waferSlices') as FormArray;
          for (let j = 0; j < result.waferSlices.length; j++) {
            waferSlices.push(
              this.fb.group({
                lotId: result.lotId,
                ocrId: result.waferSlices[j].ocrId
              })
            );
          }
          // after add lot info
          if (result.workflow) {
            if (this.lots.length === 1) {
              this.request.lotMaster = result.lotId;
              this.request.workflow = result.workflow;
            }
          }

          const lots: Lot[] = this.lots.getRawValue();
          const operationName: string = this.request.operation;
          this.request.lots = lots;
          if (operationName) {
            const re: ResponseObj = await this.ajax.getMachine(lots, operationName).toPromise();
            if (re.status === 200) {
              for (let i = 0; i < lots.length; i++) {
                this.lots
                  .at(i)
                  .get('machine')
                  .patchValue(re.data[i].machine);
                this.lots
                  .at(i)
                  .get('assyCg')
                  .patchValue(re.data[i].assyCg);
              }
            } else {
              for (let i = 0; i < lots.length; i++) {
                this.lots
                  .at(i)
                  .get('machine')
                  .patchValue('');
              }
            }
          }
          this.request.lots = this.lots.getRawValue();
          const res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
          if (res.status === 200 && res.data) {
            const score: Score = Object.assign({}, res.data);
            this.store.dispatch(setscore(score));
            this.store.dispatch(setscoreold(score));
          }

          // get all operation
          this.operations = this.request.operation
            ? [{ id: 999, label: this.request.operation, value: this.request.operation }]
            : [];
          for (let j = 0; j < this.request.lots.length; j++) {
            if (this.request.lots[j].problemType === 0) {
              this.processing = true;
              const resObj: ResponseObj = await this.ajax.getOperations(this.request.lots[j].lotId).toPromise();
              for (let i = 0; i < resObj.data.operations.length; i++) {
                this.operations.push({
                  id: i + 1,
                  label: resObj.data.operations[i],
                  value: resObj.data.operations[i]
                });
              }
            }
          }
          this.operations = this.operations.filter((value, idx, self) => {
            return self.indexOf(value) === idx;
          });
          this.form.get('operation').patchValue(this.request.operation);
          this.processing = false;

          // apply change
          this.onChange(problem);
        }
      } catch (ex) {
        // On Crashed
        console.error('D2 Lot (Add Lot) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.processing = false;
        }, 50);
      }
    }
  }
  removeLot(idx: number): void {
    alertConfirm(
      `Make sure, you want to remove Lot: ${this.lots.getRawValue()[idx].lotId}.`,
      'Are you sure ?',
      async result => {
        if (result.value) {
          this.lots = this.formIn.get('lots') as FormArray;
          if (this.lots.length === 2 && this.lots.getRawValue()[idx].workflow) {
            this.request.lotMaster = this.lots.getRawValue()[idx].lotId;
            this.request.workflow = this.lots.getRawValue()[idx].workflow;
            this.request.operation = '';
          }
          if (this.isInProcess) {
            if (this.lots.length === 1) {
              this.request.lotMaster = this.lots.at(0).get('lotId').value;
              this.request.workflow = this.lots.at(0).get('workflow').value;
              this.request.operation = '';
            }
          }
          // After get operations
          const lotId: number = parseInt(this.lots.at(idx).get('id').value, 10);
          if (lotId !== 0) {
            this.lotsRemove.push(lotId);
          }
          this.lots.removeAt(idx);
          if (this.lots.length === 0) {
            this.request.lotMaster = '';
            this.request.workflow = '';
            this.request.operation = '';
          }
        }

        // get all operation
        try {
          this.operations = this.request.operation
            ? [{ id: 999, label: this.request.operation, value: this.request.operation }]
            : [];
          for (let j = 0; j < this.request.lots.length; j++) {
            if (this.request.lots[j].problemType === 0) {
              this.processing = true;
              const resObj: ResponseObj = await this.ajax.getOperations(this.request.lots[j].lotId).toPromise();
              for (let i = 0; i < resObj.data.operations.length; i++) {
                this.operations.push({
                  id: i + 1,
                  label: resObj.data.operations[i],
                  value: resObj.data.operations[i]
                });
              }
            }
          }
          this.operations = this.operations.filter((value, index, self) => {
            return self.indexOf(value) === index;
          });
          this.form.get('operation').patchValue(this.request.operation);
          this.processing = false;
        } catch (ex) {
          console.error('D2 Lot (Remove Lot) Errors: ', ex);
        } finally {
          // apply change
          this.onChange(idx);
        }
      }
    );
  }

  async onDeleteLots() {
    try {
      const result = await alertConfirm();
      if (result.value) {
        let lotIdx = 0;
        while (this.lots.length && lotIdx !== -1) {
          lotIdx = this.lots.getRawValue().findIndex(obj => obj.selectedLot === true);
          if (this.lots.getRawValue()[lotIdx].id) {
            this.lotsRemove.push(this.lots.getRawValue()[lotIdx].id);
          }
          this.request.lots.splice(lotIdx, 1);
          this.lots.removeAt(lotIdx);
        }
        this.chkAll = false;
        this.formIn.patchValue({ selectedLot: this.chkAll });
        this.lotIsChange = true;
        this.onChange();
      }
    } catch (ex) {
      console.error('D2 Lot (delete lots) Errors: ', ex);
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.lots.controls, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.lots.controls.length; i++) {
      this.lots
        .at(i)
        .get('seq')
        .patchValue(i + 1);
    }
    this.setrequest();
  }

  downloadFile(fileName: string) {
    this.ajax.getTemplate(fileName).subscribe(response => {
      // TODO
    });
  }

  async selectFile(event, form: string, control: string) {
    try {
      if (this[form].get(control).value) {
        this.loading = true;
        let response: ResponseObj = await this.ajax.removeFile(this[form].get(control).value).toPromise();
        if (event.target.files[0] && response.status === 200) {
          const formData = new FormData();
          formData.append('file', event.target.files[0], event.target.files[0].name);
          response = await this.ajax.uploadFile(formData).toPromise();
          if (response.status === 200) {
            response = await this.ajax.getMassUpload(response.data.split('.')[0]).toPromise();
            if (response.status === 200) {
              this.clearFormArray(this.lots);
              for (let i = 0; i < response.data.length; i++) {
                const result = response.data[i];
                this.isCollapsedSlices.push(true);
                this.lots.push(
                  this.fb.group({
                    selectedLot: [false],
                    id: [result.id],
                    seq: this.lots.controls.length + 1,
                    sampleSize: result.sampleSize,
                    osReject: result.osReject,
                    paraQty: result.paraQty,
                    safeLaunch: result.safeLaunch,
                    product12nc: [{ value: result.product12nc, disabled: true }],
                    assyCg: [{ value: result.assyCg, disabled: true }],
                    blName: [{ value: result.blName, disabled: true }],
                    currentOpt: [{ value: result.currentOpt, disabled: true }],
                    dateCode: [{ value: result.dateCode, disabled: true }],
                    lotId: [{ value: result.lotId, disabled: true }],
                    machine: [{ value: result.machine, disabled: true }],
                    handler: [{ value: result.handler, disabled: true }],
                    productDesc: [{ value: result.productDesc, disabled: true }],
                    quantity: [{ value: result.quantity, disabled: true }, Validators.min(0)],
                    rejectQty: [{ value: result.rejectQty, disabled: false }, Validators.min(0)],
                    problemType: [{ value: result.problemType || 0, disabled: true }], // default `problem` and status `disabled`
                    waferBatch: [{ value: result.waferBatch, disabled: true }],
                    waferSlice: [{ value: result.waferSlice, disabled: true }],
                    waferSlices: this.fb.array([]),
                    workflow: [{ value: result.workflow, disabled: false }],
                    disposition: ['N'],
                    rescreen1: [''],
                    rescreen2: [''],
                    rescreen3: [''],
                    result1: [''],
                    result2: [''],
                    result3: [''],
                    fuByQa1: [''],
                    fuByQa2: [''],
                    fuByQa3: [''],
                    dispositionType: ['']
                  })
                );
                const waferSlices: FormArray = this.lots.at(this.lots.length - 1).get('waferSlices') as FormArray;
                for (let j = 0; j < result.waferSlices.length; j++) {
                  waferSlices.push(
                    this.fb.group({
                      lotId: result.lotId,
                      ocrId: result.waferSlices[j].ocrId
                    })
                  );
                }
              }
            }
          }
        }
      } else {
        if (event.target.files[0]) {
          const formData = new FormData();
          formData.append('file', event.target.files[0], event.target.files[0].name);
          this.loading = true;
          let response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
          if (response.status === 200) {
            response = await this.ajax.getMassUpload(response.data.split('.')[0]).toPromise();
            if (response.status === 200) {
              this.clearFormArray(this.lots);
              for (let i = 0; i < response.data.length; i++) {
                const result = response.data[i];
                this.isCollapsedSlices.push(true);
                this.lots.push(
                  this.fb.group({
                    selectedLot: [false],
                    id: [result.id],
                    seq: this.lots.controls.length + 1,
                    sampleSize: result.sampleSize,
                    osReject: result.osReject,
                    paraQty: result.paraQty,
                    safeLaunch: result.safeLaunch,
                    product12nc: [{ value: result.product12nc, disabled: true }],
                    assyCg: [{ value: result.assyCg, disabled: true }],
                    blName: [{ value: result.blName, disabled: true }],
                    currentOpt: [{ value: result.currentOpt, disabled: true }],
                    dateCode: [{ value: result.dateCode, disabled: true }],
                    lotId: [{ value: result.lotId, disabled: true }],
                    machine: [{ value: result.machine, disabled: true }],
                    handler: [{ value: result.handler, disabled: true }],
                    productDesc: [{ value: result.productDesc, disabled: true }],
                    quantity: [{ value: result.quantity, disabled: true }, Validators.min(0)],
                    rejectQty: [{ value: result.rejectQty, disabled: false }, Validators.min(0)],
                    problemType: [{ value: result.problemType || 0, disabled: true }], // default `problem` and status `disabled`
                    waferBatch: [{ value: result.waferBatch, disabled: true }],
                    waferSlice: [{ value: result.waferSlice, disabled: true }],
                    waferSlices: this.fb.array([]),
                    workflow: [{ value: result.workflow, disabled: false }],
                    disposition: ['N'],
                    rescreen1: [''],
                    rescreen2: [''],
                    rescreen3: [''],
                    result1: [''],
                    result2: [''],
                    result3: [''],
                    fuByQa1: [''],
                    fuByQa2: [''],
                    fuByQa3: [''],
                    dispositionType: ['']
                  })
                );
                const waferSlices: FormArray = this.lots.at(this.lots.length - 1).get('waferSlices') as FormArray;
                for (let j = 0; j < result.waferSlices.length; j++) {
                  waferSlices.push(
                    this.fb.group({
                      lotId: result.lotId,
                      ocrId: result.waferSlices[j].ocrId
                    })
                  );
                }
              }
            }
          }
        }
      }
    } catch (ex) {
      // on crash
      console.error('D2 Lot (Select file) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }
  removeFile(form: string, control: string) {
    this.loading = true;
    this.ajax.removeFile(this[form].get(control).value).subscribe(response => {
      this[form].get(control).reset();
      setTimeout(() => {
        this.loading = false;
      }, 50);
    });
  }
  async onOperationChange(event) {
    if (this.form.get('operation').value && typeof event !== 'object') {
      const lots: Lot[] = this.request.lots;
      const operationName: string = this.form.get('operation').value;
      try {
        this.loading = true;
        if (this.request.lots.length > 0) {
          const response: ResponseObj = await this.ajax.getMachine(lots, operationName).toPromise();
          if (response.status === 200) {
            for (let i = 0; i < lots.length; i++) {
              if (this.request.lots[i].problemType === 0) {
                this.request.lots[i].machine = response.data[i].machine;
                this.request.lots[i].assyCg = response.data[i].assyCg;
                this.request.lots[i].handler = response.data[i].handler;
                this.lots
                  .at(i)
                  .get('machine')
                  .patchValue(response.data[i].machine);
                this.lots
                  .at(i)
                  .get('assyCg')
                  .patchValue(response.data[i].assyCg);
                this.lots
                  .at(i)
                  .get('handler')
                  .patchValue(response.data[i].handler);
              }
            }
          } else {
            for (let i = 0; i < lots.length; i++) {
              if (this.request.lots[i].problemType === 0) {
                this.request.lots[i].machine = '';
                this.lots
                  .at(i)
                  .get('machine')
                  .patchValue('');
              }
            }
            // this.form.get('operation').patchValue('');
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('D2 Lot (Get Operations) Errors: ', ex);
      } finally {
        this.loading = false;
        this.onChange(event);
      }
    }
  }
  /* Forms Event */

  /* Select Process */
  private disableLot(i: number) {
    this.lots
      .at(i)
      .get('lotId')
      .disable();
    this.lots
      .at(i)
      .get('currentOpt')
      .disable();
    this.lots
      .at(i)
      .get('quantity')
      .disable();
    this.lots
      .at(i)
      .get('dateCode')
      .disable();
    // this.lots
    //   .at(i)
    //   .get('machine')
    //   .disable();
    this.lots
      .at(i)
      .get('handler')
      .disable();
    this.lots
      .at(i)
      .get('waferBatch')
      .disable();
    this.lots
      .at(i)
      .get('waferSlice')
      .disable();
    this.lots
      .at(i)
      .get('product12nc')
      .disable();
    this.lots
      .at(i)
      .get('productDesc')
      .disable();
    this.lots
      .at(i)
      .get('blName')
      .disable();
  }
  private onPreviousProcess(): void {
    const inControls = [
      { name: 'lotId', value: '', validators: [Validators.required] },
      { name: 'problemType', value: 0, disabled: true, validators: [Validators.required] },
      { name: 'sampleSize', value: '', validators: [Validators.required, Validators.min(0)] },
      { name: 'osReject', value: '', validators: this.isFinal || this.isWafer ? [Validators.required] : [] },
      { name: 'paraQty', value: '', validators: this.isFinal || this.isWafer ? [Validators.required] : [] },
      { name: 'rejectQty', value: '', validators: [Validators.required, Validators.min(0)] },
      { name: 'safeLaunch', value: '', validators: [Validators.required] },
      { name: 'mass', value: '', validators: [] }
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
      { name: 'operation', section: 'form' }
      /* section 2 */
    ];
    this.lots = this.fb.array([]);
    this.removeControls(controls, form);
  }
  onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    if (event) {
      this.lotIsChange = true;
    }
    // On Everything Change
    const lots: Lot[] = this.formIn.getRawValue().lots;
    this.request = Object.assign(this.request, this.form.getRawValue(), { lots });
    this.request.lotsRemove = this.lotsRemove;
    this.request.d2LotValid = lots.length > 0;
    this.request.d2LotMaterialValid = this.formIn.get('lots').valid;
    this.request = Object.assign({}, this.request);
    this.store.dispatch(setrequest(this.request));
  }
  /* Select Process */

  /* Controls Management */
  private enable(form: string, control: string) {
    if (this[form].get(control)) {
      this[form].get(control).enable();
      this[form].get(control).setValidators([Validators.required]);
      this[form].updateValueAndValidity();
    }
  }
  private disable(form: string, control: string) {
    if (this[form].get(control)) {
      this[form].get(control).disable();
      this[form].get(control).clearValidators();
      this[form].updateValueAndValidity();
    }
  }
  addControls(controls: any[], form: string = 'form'): void {
    this.onRemove(form); // remove in controls
    for (let i = 0; i < controls.length; i++) {
      this.addControl(form, controls[i].name, controls[i].value, controls[i].disabled, controls[i].validators);
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
    value: any = '',
    disabled: boolean = false,
    optional?: ValidatorFn | ValidatorFn[] | AbstractControlOptions
  ): void {
    let option: ValidatorFn | ValidatorFn[] | AbstractControlOptions = null;
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
    // alertWarning('Please select operation..');
    alertWarning('Please specify machine..');
  }
  setrequest() {
    this.lotIsChange = true;
    this.request = Object.assign(this.request, this.form.getRawValue(), {
      lots: this.lots.getRawValue(),
      submit: true
    });
    this.store.dispatch(setrequest(this.request));
  }
  isShowDelete(idx) {
    if (this.lots.at(idx).get('selectedLot').disabled) {
      return false;
    }
    return true;
  }
  /* Controls Management */

  get isLotChange() {
    return (
      (this.lots && this.lots.length > 0 && this.lots.getRawValue().findIndex(obj => obj.id === 0) > -1) ||
      this.lotIsChange
    );
  }

  get isSelectedLotDisabled() {
    let disabled: boolean = true;
    if (this.lots.length === 0) {
      return true;
    } else {
      for (let i = 0; i < this.lots.length; i++) {
        if (this.lots.at(i) && !this.lots.at(i).get('selectedLot').disabled) {
          disabled = false;
        }
      }
      return disabled;
    }
  }

  get isSelectedLot() {
    return this.lots.getRawValue().filter(obj => obj.selectedLot === true).length > 0;
  }
}
