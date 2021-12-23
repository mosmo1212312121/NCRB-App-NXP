import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { Initial, IStatus, Lot, LotMaterial, ResponseObj, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService, MockService } from '../../../services';
import { setrequest } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertWarning, filterByName } from '../../../utils';
import { D2AddMaterialComponent } from './modals/d2-add-material.component';

@Component({
  selector: 'app-d2-material',
  templateUrl: 'd2-material.component.html'
})
export class D2MaterialComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  formIn: FormGroup;
  lots: FormArray;
  materials: FormArray;
  lotsRemove: number[] = [];
  materialsRemove: number[] = [];
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
  matIsChange: boolean = false;
  isEditingBy: boolean = false;
  chkAll: boolean = false;
  chkAllMat: boolean = false;

  loading: boolean = false;

  problemType: number = -1;

  bsModalRef: BsModalRef;
  lotInitial: any = {
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
    dispositionType: [''],
    otherDetail: [''],
    attach: [null],
    groupName: [''],
    cost: [''],
    removable: [true],
    onHoldQty: [0]
  };
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dropdown: DropdownService,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d2-material');

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
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
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
            selectedLot: [{ value: false, disabled: !lot.removable || lot.onHoldQty }],
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
            dispositionType: [lot.dispositionType],
            otherDetail: [lot.otherDetail],
            attach: lot.attach,
            groupName: [lot.groupName],
            cost: [lot.cost],
            removable: [lot.removable],
            onHoldQty: [lot.onHoldQty]
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

      this.materials = this.formIn.get('materials') as FormArray;
      this.clearFormArray(this.materials);
      for (let i = 0; i < this.request.materials.length; i++) {
        const material = this.request.materials[i];
        this.materials.push(this.fb.group(Object.assign({}, material, { selectedMat: false })));
        this.materials
          .at(i)
          .get('problemType')
          .disable();
        this.materials
          .at(i)
          .get('lotId')
          .disable();
        this.materials
          .at(i)
          .get('currentOpt')
          .disable();
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
      } else {
        this.formIn.enable();
        if (this.isOwner && (this.isRequest || this.isAcknowledge) && this.id) {
          this.formIn.get('problemType').enable();
          this.formIn.get('problemType').updateValueAndValidity();
        } else {
          this.formIn.get('problemType').disable();
          this.formIn.get('problemType').updateValueAndValidity();
        }
        if (this.isWafer || this.isFinal) {
          this.formIn.get('osReject').setValidators([Validators.required]);
          this.formIn.get('paraQty').setValidators([Validators.required]);
        } else {
          this.formIn.get('osReject').clearValidators();
          this.formIn.get('paraQty').clearValidators();
        }
        this.formIn.get('osReject').updateValueAndValidity();
        this.formIn.get('paraQty').updateValueAndValidity();

        // Lots enable/disable
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
        if (this.isSelectedLotDisabled) {
          this.formIn.get('selectedLot').disable();
        }

        // Materials enable/disable
        for (let i = 0; i < this.request.materials.length; i++) {
          this.materials
            .at(i)
            .get('lotId')
            .disable();
          this.materials
            .at(i)
            .get('currentOpt')
            .disable();
          if (this.request.materials[i].id && this.request.materials[i].disposition !== 'N') {
            this.materials.at(i).disable();
          }
        }
        if (this.isSelectedMatDisabled) {
          this.formIn.get('selectedMat').disable();
        }
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
    this.typeName = 'Material';
    this.onMaterial();
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

  onToggleChkMat() {
    this.chkAllMat = !this.chkAllMat;
    for (let i = 0; i < this.materials.length; i++) {
      if (this.materials.at(i) && !this.materials.at(i).get('selectedMat').disabled) {
        this.request.materials[i].selectedMat = this.chkAllMat;
        this.materials.at(i).patchValue({ selectedMat: this.chkAllMat });
      }
    }
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

  async onDeleteMats() {
    try {
      const result = await alertConfirm();
      if (result.value) {
        const ids = this.materials
          .getRawValue()
          .filter(obj => obj.selectedMat)
          .map(obj => obj.id);
        this.materialsRemove = this.materialsRemove.concat(ids);
        let idx = 0;
        while (this.materials.length && idx !== -1) {
          idx = this.materials.getRawValue().findIndex(obj => obj.selectedMat === true);
          if (idx > -1) {
            this.materials.removeAt(idx);
            this.request.materials.splice(idx, 1);
          }
        }
        this.chkAllMat = false;
        this.formIn.patchValue({ selectedMat: this.chkAllMat });
        this.matIsChange = true;
        this.onChange();
      }
    } catch (ex) {
      console.error('D2 Material (delete materials) Errors: ', ex);
    }
  }

  async onGetMaterials(idx: number) {
    try {
      this.loading = true;
      const response: ResponseObj = await this.ajax.getLotInfo(this.request.lots[idx].lotId).toPromise();
      if (response.status === 200) {
        const result = response.data as Lot;
        // after add lot info
        if (result.workflow) {
          if (this.lots.length === 1) {
            this.request.lotMaster = result.lotId;
            this.request.workflow = result.workflow;
          }
        }

        if (result.step) {
          this.request.operation = result.step;
        }

        this.lotIsChange = true;

        // const materials: LotMaterial[] = this.materials.getRawValue();

        const mfgRe: ResponseObj = await this.dropdown.getDropdownByGroup('MFG').toPromise();
        const mfgName: string =
          mfgRe.status === 200 ? mfgRe.data.filter(obj => obj.value === this.request.mfg2)[0].label : '';
        const materials = [Object.assign({}, result)];
        if (mfgName) {
          const re: ResponseObj = await this.ajax
            .getMaterial(
              materials,
              this.getPhase(mfgName),
              this.request.materialTypes.find(obj => this.request.materialType === obj.id).label
            )
            .toPromise();
          if (re.status === 200) {
            for (let i = 0; i < re.data.length; i++) {
              const index: number = this.request.materials.findIndex(
                obj => obj.material12nc === re.data[i].material12nc && obj.materialType === re.data[i].materialType
              );
              console.log(index, re.data[i].material12nc, re.data[i].materialType);
              if (index === -1) {
                this.materials.push(
                  this.fb.group({
                    selectedMat: [false],
                    id: [0],
                    seq: this.materials.controls.length + 1,
                    lotId: [{ value: re.data[i].lotId, disabled: true }],
                    sampleSize: this.request.lots[idx].sampleSize,
                    productDesc: [{ value: re.data[i].productDesc, disabled: true }],
                    rejectQty: [{ value: re.data[i].rejectQty, disabled: false }],
                    problemType: [{ value: result.problemType || 0, disabled: true }], // default `problem` and status `disabled`
                    safeLaunch: this.request.lots[idx].safeLaunch,
                    materialType: [re.data[i].materialType, Validators.required],
                    material12nc: [re.data[i].material12nc, Validators.required],
                    materialDescription: [re.data[i].materialDescription, Validators.required],
                    supplier: [re.data[i].supplier, Validators.required],
                    invoiceNo: [re.data[i].invoiceNo, Validators.required],
                    supplierLotId: [re.data[i].supplierLotId, Validators.required],
                    onHoldQty: re.data[i].onHoldQty,
                    workflow: [{ value: result.workflow, disabled: false }],
                    currentOpt: [{ value: result.currentOpt, disabled: true }]
                  })
                );
              }
            }
            this.request.materials = this.materials.getRawValue();
          }
          this.matIsChange = true;
          this.onChange('material');
        }
      }
    } catch (ex) {
      console.error('D2-Material Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  /* Forms Event */
  async addLot(problem: string = '') {
    this.formInSubmit = true;
    this.formIn.get('selectedLot').clearValidators();
    this.formIn.get('selectedLot').updateValueAndValidity();
    this.formIn.get('selectedMat').clearValidators();
    this.formIn.get('selectedMat').updateValueAndValidity();
    if (!this.request.materialType) {
      alertWarning('Please fill MaterialType form..', 'Validation');
      return;
    }
    if (this.formIn.valid) {
      /* Prepare data */
      this.formInSubmit = false;
      const lotName: string = this.formIn.get('lotId').value;
      this.lots = this.formIn.get('lots') as FormArray;
      this.materials = this.formIn.get('materials') as FormArray;
      const data = this.formIn.getRawValue();
      const saveLots = this.formIn.getRawValue().lots;
      const saveMats = this.formIn.getRawValue().materials;
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
      this.formIn.get('materials').patchValue(saveMats);

      /* Prepare data */
      this.loading = true;
      if (problem === 'material') {
        // Material
        try {
          const response: ResponseObj = await this.ajax.getLotInfo(lotName).toPromise();
          if (response.status === 200) {
            const result = response.data as Lot;
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
                productDesc: [{ value: result.productDesc, disabled: true }],
                quantity: [{ value: result.quantity, disabled: true }],
                rejectQty: [{ value: data.rejectQty, disabled: false }],
                problemType: [
                  { value: (!this.isOwner ? data.problemType : result.problemType) || 0, disabled: !this.isOwner }
                ], // default `problem` and status `disabled`
                waferBatch: [{ value: result.waferBatch, disabled: true }],
                workflow: [{ value: result.workflow, disabled: false }],
                ...this.lotInitial
              })
            );
            // after add lot info
            if (result.workflow) {
              if (this.lots.length === 1) {
                this.request.lotMaster = result.lotId;
                this.request.workflow = result.workflow;
              }
            }

            if (result.step) {
              this.request.operation = result.step;
            }

            this.lotIsChange = true;

            // const materials: LotMaterial[] = this.materials.getRawValue();

            const mfgRe: ResponseObj = await this.dropdown.getDropdownByGroup('MFG').toPromise();
            const mfgName: string =
              mfgRe.status === 200 ? mfgRe.data.filter(obj => obj.value === this.request.mfg2)[0].label : '';
            const materials = [Object.assign({}, result)];
            if (mfgName) {
              const re: ResponseObj = await this.ajax
                .getMaterial(
                  materials,
                  this.getPhase(mfgName),
                  this.request.materialTypes.find(obj => this.request.materialType === obj.id).label
                )
                .toPromise();
              if (re.status === 200) {
                for (let i = 0; i < re.data.length; i++) {
                  this.materials.push(
                    this.fb.group({
                      selectedMat: [false],
                      id: [0],
                      seq: this.materials.controls.length + 1,
                      lotId: [{ value: re.data[i].lotId, disabled: true }],
                      sampleSize: data.sampleSize,
                      productDesc: [{ value: re.data[i].productDesc, disabled: true }],
                      rejectQty: [{ value: re.data[i].rejectQty, disabled: false }],
                      problemType: [{ value: result.problemType || 0, disabled: true }], // default `problem` and status `disabled`
                      safeLaunch: data.safeLaunch,
                      materialType: [re.data[i].materialType, Validators.required],
                      material12nc: [re.data[i].material12nc, Validators.required],
                      materialDescription: [re.data[i].materialDescription, Validators.required],
                      supplier: [re.data[i].supplier, Validators.required],
                      invoiceNo: [re.data[i].invoiceNo, Validators.required],
                      supplierLotId: [re.data[i].supplierLotId, Validators.required],
                      onHoldQty: re.data[i].onHoldQty,
                      workflow: [{ value: result.workflow, disabled: false }],
                      currentOpt: [{ value: result.currentOpt, disabled: true }]
                    })
                  );
                }
                this.request.materials = this.materials.getRawValue();
              }
              this.matIsChange = true;
              this.onChange(problem);
            }
          }
        } catch (ex) {
          // On Crashed
          console.error('D2 Material Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.loading = false;
          }, 50);
        }
      }
    }
  }
  removeLot(idx: number): void {
    alertConfirm(
      `Make sure, you want to remove Lot: ${this.lots.getRawValue()[idx].lotId}.`,
      'Are you sure ?',
      result => {
        if (result.value) {
          this.lots = this.formIn.get('lots') as FormArray;
          this.materials = this.formIn.get('materials') as FormArray;
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
          const id: number = parseInt(this.lots.at(idx).get('id').value, 10);
          if (id !== 0) {
            this.lotsRemove.push(id);
          }
          this.lots.removeAt(idx);
          if (this.lots.length === 0) {
            this.request.lotMaster = '';
            this.request.workflow = '';
            this.request.operation = '';
          }
        }
        this.lotIsChange = true;
        this.onChange(idx);
      }
    );
  }
  removeMaterial(idx: number): void {
    alertConfirm(
      `Make sure, you want to remove Material: ${this.materials.getRawValue()[idx].material12nc}.`,
      'Are you sure ?',
      result => {
        if (result.value) {
          this.materials = this.formIn.get('materials') as FormArray;

          // After get operations
          const id: number = parseInt(this.materials.at(idx).get('id').value, 10);
          if (id !== 0) {
            this.materialsRemove.push(id);
          }
          this.materials.removeAt(idx);
        }
        this.matIsChange = true;
        this.onChange(idx);
      }
    );
  }
  onSelectedLotChange() {
    const count: number = this.lots.getRawValue().filter(obj => obj.selectedLot === true).length;
    let countLotCanChk: number = 0;
    for (let i = 0; i < this.lots.length; i++) {
      if (!this.lots.at(i).get('selectedLot').disabled) {
        countLotCanChk++;
      }
    }
    if (countLotCanChk === count) {
      this.chkAll = true;
    } else {
      this.chkAll = false;
    }
    this.formIn.get('selectedLot').patchValue(this.chkAll);
  }
  onSelectedMatChange() {
    const count: number = this.materials.getRawValue().filter(obj => obj.selectedMat === true).length;
    let countMatCanChk: number = 0;
    for (let i = 0; i < this.materials.length; i++) {
      if (!this.materials.at(i).get('selectedMat').disabled) {
        countMatCanChk++;
      }
    }
    if (countMatCanChk === count) {
      this.chkAllMat = true;
    } else {
      this.chkAllMat = false;
    }
    this.formIn.get('selectedMat').patchValue(this.chkAllMat);
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
  dropMaterial(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.materials.controls, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.materials.controls.length; i++) {
      this.materials
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
  onAddMaterial() {
    // on add new material
    this.bsModalRef = this.modalService.show(D2AddMaterialComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        data: {
          sampleSize: '',
          problemType: '',
          safeLaunch: '',
          invoiceNo: '',
          workflow: '',
          currentOpt: '',
          isWaferFAB: this.isWaferFAB
        }
      }
    });
    this.bsModalRef.content.event.subscribe((data: LotMaterial) => {
      // console.log('Added Material : ', data);
      this.materials.push(
        this.fb.group({
          selectedMat: [false],
          id: [0],
          seq: this.materials.controls.length + 1,
          lotId: [{ value: data.lotId, disabled: true }],
          sampleSize: data.sampleSize,
          productDesc: [{ value: data.productDesc, disabled: true }],
          rejectQty: [{ value: data.rejectQty, disabled: false }],
          problemType: [{ value: data.problemType || 0, disabled: true }], // default `problem` and status `disabled`
          safeLaunch: data.safeLaunch,
          materialType: [data.materialType, Validators.required],
          material12nc: [data.material12nc, Validators.required],
          materialDescription: [data.materialDescription, Validators.required],
          supplier: [data.supplier, Validators.required],
          invoiceNo: [data.invoiceNo, Validators.required],
          supplierLotId: [data.supplierLotId, Validators.required],
          onHoldQty: data.onHoldQty,
          workflow: [{ value: data.workflow, disabled: false }],
          currentOpt: [{ value: data.currentOpt, disabled: true }]
        })
      );
      this.request.materials = this.materials.getRawValue();
      if (this.isSelectedMatDisabled) {
        this.formIn.get('selectedMat').disable();
      } else {
        this.formIn.get('selectedMat').enable();
      }
      this.onChange();
    });
  }
  async onUpdateMats() {
    const result = await alertConfirm('Confirmation', 'Are you sure ?');
    if (result.value) {
      this.request.materials = this.materials.getRawValue();
      this.request.materialsRemove = this.materialsRemove;
      const response = await this.ajax.updateMats(this.request).toPromise();
      if (response.status === 200) {
        const materials: LotMaterial[] = (response.data as Initial).materials;
        for (let i = 0; i < this.materials.length; i++) {
          console.log(materials);
          this.materials.at(i).patchValue({
            selectedMat: [false],
            id: [materials[i].id],
            seq: this.materials.controls.length + 1,
            lotId: [{ value: materials[i].lotId, disabled: true }],
            sampleSize: materials[i].sampleSize,
            productDesc: [{ value: materials[i].productDesc, disabled: true }],
            rejectQty: [{ value: materials[i].rejectQty, disabled: false }],
            problemType: [{ value: materials[i].problemType || 0, disabled: true }], // default `problem` and status `disabled`
            safeLaunch: materials[i].safeLaunch,
            materialType: [materials[i].materialType, Validators.required],
            material12nc: [materials[i].material12nc, Validators.required],
            materialDescription: [materials[i].materialDescription, Validators.required],
            supplier: [materials[i].supplier, Validators.required],
            invoiceNo: [materials[i].invoiceNo, Validators.required],
            supplierLotId: [materials[i].supplierLotId, Validators.required],
            onHoldQty: materials[i].onHoldQty,
            workflow: [{ value: materials[i].workflow, disabled: false }],
            currentOpt: [{ value: materials[i].currentOpt, disabled: true }]
          });
        }
        this.materialsRemove = [];
        this.request.materials = this.materials.getRawValue();
        this.request.materialsRemove = this.materialsRemove;
        this.matIsChange = false;
        this.onChange();
      }
    }
  }

  async selectFile(event, form: string, control: string) {
    try {
      if (this[form].get(control).value) {
        this.loading = true;
        let response: ResponseObj = await this.ajax.removeFile(this[form].get(control).value).toPromise();
        if (event.target.files[0] && response.status === 200) {
          const formData = new FormData();
          formData.append(
            'file',
            event.target.files[0],
            `${this.request.ncnumber}-D2MAT-${event.target.files[0].name}`
          );
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
                    ...this.lotInitial
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
          formData.append(
            'file',
            event.target.files[0],
            `${this.request.ncnumber}-D2MAT-${event.target.files[0].name}`
          );
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
                    ...this.lotInitial
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
  private getPhase(mgfName: string): string {
    switch (mgfName.toLowerCase()) {
      case 'pa&ll':
        return 'PA';
      case 'final test':
        return 'FT';
      case 'wafer test':
        return 'WT';
      case 'lp':
        return 'AS';
      case 'pack':
        return 'PK';
      default:
        return 'NONE';
    }
  }
  private onMaterial(): void {
    const inControls = [
      { name: 'lotId', value: '', validators: [Validators.required] },
      { name: 'problemType', value: 0, disabled: true, validators: [Validators.required] },
      { name: 'sampleSize', value: '', validators: [Validators.required] },
      { name: 'rejectQty', value: '', validators: [Validators.required] },
      { name: 'osReject', value: '', validators: this.isFinal || this.isWafer ? [Validators.required] : [] },
      { name: 'paraQty', value: '', validators: this.isFinal || this.isWafer ? [Validators.required] : [] },
      { name: 'safeLaunch', value: '', validators: [Validators.required] },
      { name: 'mass', value: '', validators: [] },
      { name: 'selectedLot', value: false, validators: [] },
      { name: 'selectedMat', value: false, validators: [] }
    ];
    this.addControls(inControls, 'formIn');
    this.formIn.addControl('lots', this.fb.array([]));
    this.lots = this.formIn.get('lots') as FormArray;
    this.formIn.addControl('materials', this.fb.array([]));
    this.materials = this.formIn.get('materials') as FormArray;
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
      { name: 'selectedLot', section: 'formIn' },
      { name: 'selectedMat', section: 'formIn' }
      /* section 2 */
    ];
    this.lots = this.fb.array([]);
    this.materials = this.fb.array([]);
    this.removeControls(controls, form);
  }
  onChange(event?) {
    if (event && typeof event === 'object') {
      if (event.target.value) {
        // TODO Nothing
        this.matIsChange = true;
      } else {
        return;
      }
    }
    // On Everything Change
    const lots: Lot[] = this.formIn.getRawValue().lots;
    const materials: LotMaterial[] = this.formIn.getRawValue().materials;
    this.request = Object.assign(this.request, { lots, materials });
    this.request.lotsRemove = this.lotsRemove;
    this.request.materialsRemove = this.materialsRemove;
    this.request.d2LotValid = lots.length > 0 && this.formIn.get('lots').valid;
    this.request.d2LotMaterialValid = materials.length > 0;
    this.request = Object.assign({}, this.request);
    this.store.dispatch(setrequest(this.request));
  }
  /* Select Process */

  /* Controls Management */
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
    alertWarning('Please select operation..');
  }
  setrequest() {
    this.request = Object.assign(this.request, {
      lots: this.lots.getRawValue(),
      materials: this.materials.getRawValue(),
      submit: true
    });
    this.store.dispatch(setrequest(this.request));
  }
  isShowDelete(idx) {
    return !this.lots.at(idx).get('selectedLot').disabled;
  }
  isShowDeleteMat(idx) {
    return !this.materials.at(idx).get('selectedMat').disabled;
  }
  /* Controls Management */

  get isLotChange() {
    return (
      (this.lots && this.lots.length > 0 && this.lots.getRawValue().findIndex(obj => obj.id === 0) > -1) ||
      this.lotIsChange
    );
  }

  get isMatChange() {
    return (
      (this.materials &&
        this.materials.length > 0 &&
        this.materials.getRawValue().findIndex(obj => obj.id === 0) > -1) ||
      this.matIsChange
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

  get isSelectedMatDisabled() {
    let disabled: boolean = true;
    if (this.materials.length === 0) {
      return true;
    } else {
      for (let i = 0; i < this.materials.length; i++) {
        if (this.materials.at(i) && !this.materials.at(i).get('selectedMat').disabled) {
          disabled = false;
        }
      }
      return disabled;
    }
  }

  get isSelectedLot() {
    return this.lots.getRawValue().filter(obj => obj.selectedLot === true).length > 0;
  }

  get isSelectedMat() {
    return this.materials.getRawValue().filter(obj => obj.selectedMat === true).length > 0;
  }

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }
}
