import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { Initial, IStatus, LotMaterial, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService, MockService } from '../../../services';
import { setrequest } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertWarning, filterByName } from '../../../utils';

@Component({
  selector: 'app-d3-material',
  templateUrl: 'd3-material.component.html'
})
export class D3MaterialComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() ncrbid: number = null;
  @Input() ncrbno: string = '';
  dispositionTypes: NxpSelection[] = [];
  reScreens: NxpSelection[] = [];
  formIn: FormGroup;
  lots: FormArray;
  lotsRemove: number[] = [];
  materials: FormArray;
  matsRemove: number[] = [];
  submit: boolean = false;
  formInSubmit: boolean = false;
  typeName: string = '';
  id: number = null;
  params: Parameter[] = [];
  paramsSub: any = null;
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
  bsModalRef: BsModalRef;
  chkAllMat: boolean = false;

  isOwner: boolean = false;
  isInProcess: boolean = false;
  isMaterial: boolean = false;
  isPreviousProcess: boolean = false;
  isOnHold: boolean = false;
  notFinalAndWafer: boolean = false;
  isFinal: boolean = false;
  isWafer: boolean = false;
  isAcknowledge: boolean = false;
  isRequest: boolean = false;
  isSubmit: boolean = false;

  loading: boolean = false;
  processing: boolean = false;

  problemType: number = -1;
  collapse: boolean = false;
  routeSub: any;
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private dropdown: DropdownService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-material');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.formIn = this.fb.group({
      selectedMat: [false],
      submit: [false],
      note: [null, Validators.required]
    });
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
      this.isSubmit = this.request.isSubmit;
      if (this.request.problemType !== this.problemType) {
        this.problemType = this.request.problemType;
        this.onTypeChange(this.problemType);
      }
      this.materials = this.formIn.get('materials') as FormArray;
      this.clearFormArray(this.materials);
      for (let i = 0; i < this.request.materials.length; i++) {
        // new Instance Lots
        const material: LotMaterial = this.request.materials[i];
        this.materials.push(
          this.fb.group(
            Object.assign({}, material, {
              selectedMat: false,
              collapse: !this.isOwnerMaterial || (this.isOwnerMaterial && material.disposition !== 'N'),
              submit: false
            })
          )
        );
      }
      this.materials.disable();
      for (let i = 0; i < this.materials.length; i++) {
        const disposition: string = this.materials.at(i).get('disposition').value;
        if (
          ((disposition === 'N' || disposition === 'R') && this.isOwnerMaterial) ||
          (disposition === 'P' && this.request.isEngineer)
        ) {
          this.materials
            .at(i)
            .get('selectedMat')
            .enable();
          if (this.isOwnerMaterial) {
            this.materials
              .at(i)
              .get('note')
              .enable();
            this.materials
              .at(i)
              .get('note')
              .setValidators([Validators.required]);
            this.materials
              .at(i)
              .get('note')
              .updateValueAndValidity();
          }
        }
      }
      if (this.id !== this.request.id) {
        // On detail page
        this.id = this.request.id;
        this.formIn.updateValueAndValidity();
        if (!this.isOwnerMaterial && !this.request.isEngineer) {
          this.formIn.disable();
        } else {
          this.formIn.enable();
        }
        this.onChange();
      }

      // on disabled all
      this.onDisabledAll();
    });
  }

  ngOnInit(): void {
    this.dispositionTypes = this.mock.getDispositionTypes();
    this.reScreens = this.mock.getReScreens();
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D3-MATERIAL') === -1;
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
    this.iStatusSub.unsubscribe();
  }

  onTypeChange(event: number): void {
    // if (event && typeof event !== 'object') {
    //   if (parseInt(event.toString(), 10) === 3) {
    //     // Material
    //     this.typeName = 'Material';
    //   }
    // } else {
    // }
    this.typeName = 'Material';
    this.onMaterial();
  }

  onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    // On Everything Change
    this.request.isApproveAllMat = this.isApproveAll;
    this.request.isDispositionAllMat = this.isDispositionAll;
    this.request = Object.assign({}, this.request, { materials: this.materials.getRawValue() });
    this.store.dispatch(setrequest(this.request));
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

  onTriggerChk() {
    let nomore: boolean = false;
    for (let i = 0; i < this.materials.length; i++) {
      if (!this.materials.at(i).get('selectedMat').disabled) {
        if (!this.materials.at(i).get('selectedMat').value) {
          nomore = true;
        }
      }
    }
    this.chkAllMat = !nomore;
    this.formIn.get('selectedMat').patchValue(!nomore);
  }

  async onApprove(idx?: number) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        const basicAuth: string = localStorage.getItem('basic_auth');
        this.loading = true;
        if (idx > -1) {
          // only one
          this.materials
            .at(idx)
            .get('selectedMat')
            .disable();
          this.materials
            .at(idx)
            .get('disposition')
            .patchValue('Y');

          // on disabled all
          this.onDisabledAll();
          const material = (this.materials.at(idx) as FormGroup).getRawValue();
          const response: ResponseObj = await this.ajax
            .getMatDispositionApprove(material.id, basicAuth, material)
            .toPromise();
          if (response.status === 200) {
            console.log('Response => ', response);
            this.onChange();
          }
        } else {
          // all selected
          this.loading = true;
          for (let i = 0; i < this.materials.length; i++) {
            if ((this.materials.at(i) as FormGroup).getRawValue().selectedMat) {
              this.materials
                .at(i)
                .get('selectedMat')
                .disable();
              this.materials.at(i).patchValue({ disposition: 'Y' });
            }
          }

          // on disabled all
          this.onDisabledAll();
          const response = await this.ajax
            .getMatDispositionApproveAll(
              this.request.ncnumber,
              basicAuth,
              this.materials.getRawValue().filter(obj => obj.selectedMat === true)
            )
            .toPromise();
          if (response.status === 200) {
            console.log('Response => ', response);
            this.onChange();
          }
        }
      }
    } catch (ex) {
      // on errors
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  async onReject(idx?: number) {
    try {
      console.log(idx);
      const result = await alertConfirm();
      if (result.value) {
        const basicAuth: string = localStorage.getItem('basic_auth');
        this.loading = true;
        if (idx > -1) {
          // only one
          this.materials
            .at(idx)
            .get('selectedMat')
            .disable();
          this.materials
            .at(idx)
            .get('disposition')
            .patchValue('R');

          // on disabled all
          this.onDisabledAll();
          const material = (this.materials.at(idx) as FormGroup).getRawValue();
          const response: ResponseObj = await this.ajax
            .getMatDispositionReject(material.id, basicAuth, material)
            .toPromise();
          if (response.status === 200) {
            console.log('Response => ', response);
            this.onChange();
          }
        } else {
          // all selected
          this.loading = true;
          for (let i = 0; i < this.materials.length; i++) {
            if ((this.materials.at(i) as FormGroup).getRawValue().selectedMat) {
              this.materials
                .at(i)
                .get('selectedMat')
                .disable();
              this.materials.at(i).patchValue({ disposition: 'R' });
            }
          }

          // on disabled all
          this.onDisabledAll();
          const response = await this.ajax
            .getMatDispositionRejectAll(
              this.request.ncnumber,
              basicAuth,
              this.materials.getRawValue().filter(obj => obj.selectedMat === true)
            )
            .toPromise();
          if (response.status === 200) {
            console.log('Response => ', response);
            this.onChange();
          }
        }
      }
    } catch (ex) {
      // on errors
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  async onSubmitMat(idx: number) {
    this.materials.at(idx).patchValue({ submit: true });
    if (this.materials.at(idx).valid) {
      try {
        const result = await alertConfirm();
        if (result.value) {
          this.loading = true;
          this.materials
            .at(idx)
            .get('selectedMat')
            .disable();
          this.materials
            .at(idx)
            .get('disposition')
            .patchValue('P');

          // on disabled all
          this.onDisabledAll();

          const material = (this.materials.at(idx) as FormGroup).getRawValue();
          const response: ResponseObj = await this.ajax.getSubmitMatDisposition(material.id, material).toPromise();
          if (response.status === 200) {
            console.log('Response => ', response);
            this.onChange();
          }
        }
      } catch (ex) {
        // Errors
        console.error('On Submit Material Disposition => ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async onSubmitMatSelected() {
    this.formIn.patchValue({ submit: true });
    if (this.formIn.get('note').valid) {
      try {
        const result = await alertConfirm();
        if (result.value) {
          this.loading = true;
          for (let i = 0; i < this.materials.length; i++) {
            if ((this.materials.at(i) as FormGroup).getRawValue().selectedMat) {
              this.materials
                .at(i)
                .get('selectedMat')
                .disable();
              this.materials.at(i).patchValue({ note: this.formIn.get('note').value, disposition: 'P' });
            }
          }

          // on disabled all
          this.onDisabledAll();

          const response = await this.ajax
            .getSubmitMatDispositionAll(
              this.request.ncnumber,
              this.materials.getRawValue().filter(obj => obj.selectedMat === true)
            )
            .toPromise();
          if (response.status === 200) {
            console.log('Response => ', response);
            this.onChange();
          }
        }
      } catch (ex) {
        // Errors
        console.error('On Submit Materials Disposition => ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  onDisabledAll() {
    if (this.isSelectedMatDisabledAll) {
      this.chkAllMat = false;
      this.formIn.get('selectedMat').disable();
      this.formIn.get('selectedMat').patchValue(false);
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
      { name: 'mass', required: false, value: '' }
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
      { name: 'lots', section: 'formIn' }
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

  public void(obj: any) {
    // ....
  }

  public getStatus(disposition: string, problem?: number): string {
    switch (disposition) {
      case 'S':
        return 'Completed';
      case 'Y':
        return 'Completed';
      case 'R':
        return 'Rejected';
      case 'P':
        return 'Waiting for what ?';
      case 'E':
        return 'Waiting for Engineer';
      case 'N':
        return 'Pending';
      default:
        return 'Pending';
    }
  }

  get isDispositionAll() {
    let fact: boolean = true;
    for (let i = 0; i < this.request.materials.length; i++) {
      const { disposition } = this.request.materials[i];
      if (disposition === 'N' || disposition === 'R') {
        fact = false;
      }
    }
    return fact;
  }

  get isApproveAll() {
    let fact: boolean = true;
    for (let i = 0; i < this.request.materials.length; i++) {
      const { disposition } = this.request.materials[i];
      if (disposition === 'N' || disposition === 'P' || disposition === 'R') {
        fact = false;
      }
    }
    return fact;
  }

  get isSelectedMat() {
    return this.materials.getRawValue().filter(obj => obj.selectedMat === true).length > 0;
  }

  get isSelectedMatDisabledAll() {
    let disabledAll = true;
    for (let i = 0; i < this.materials.length; i++) {
      if (!this.materials.at(i).get('selectedMat').disabled) {
        disabledAll = false;
      }
    }
    return disabledAll;
  }

  get isOwnerMaterial(): boolean {
    return (
      this.request.materialOwners?.length > 0 &&
      this.user?.empId !== 'empId' &&
      this.request.materialOwners.findIndex(obj => obj.empId === this.user.empId) > -1
    );
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_6').value : 'Loading';
  }

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }
}
