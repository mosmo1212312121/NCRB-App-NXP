import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant, Status } from '../../../constants';
import { FileObj, Initial, IStatus, Parameter, ResponseObj, Score, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService, MockService } from '../../../services';
import { setrequest, setscore, setscoreold } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, filterByName } from '../../../utils';

@Component({
  selector: 'app-d2',
  templateUrl: 'd2.component.html'
})
export class D2Component extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup = null;
  categories: NxpSelection[] = [];
  rejectNames: NxpSelection[] = [];
  rejectNamesFiltered: NxpSelection[] = [];
  faCodes: NxpSelection[] = [];
  materialTypes: NxpSelection[] = [];
  typeName: string = '';
  submit: boolean = false;
  id: number = null;
  user: User = null;
  userSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  iStatusSub: any = null;
  status: Status = new Status();
  dateConstant: DateConstant = new DateConstant();
  ownerFilter = filterByName;
  bsModalRef: BsModalRef;

  isAcknowledge: boolean = false;
  isDispositionAll: boolean = false;
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
  isEditingBy: boolean = false;
  notFinalAndWafer: boolean = false;

  problemType: number = -1;
  mfg: number = -1;
  statuObj: IStatus = null;
  loading: boolean = false;
  attachFiles: FormArray;
  collapse: boolean = false;
  routeSub: any;
  _facode: any = null;
  _rejectName: any = null;
  @Output() toggleCollapse: EventEmitter<boolean> = new EventEmitter();
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private dropdown: DropdownService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d2');

    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
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
    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      this.rejectNames = this.request.rejectNames;
      // if (this.rejectNamesFiltered.length === 0) {
      //   this.rejectNamesFiltered = this.rejectNames.slice();
      // } else {
      // }
      const { mfg, subMfg, rejectName } = request;
      const data = JSON.parse(localStorage.getItem('rejectNames'))
        .filter(o => o.mfg.toString() === mfg.toString() && o.subMfg.toString() === subMfg.toString())
        .map(o => {
          return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
        });
      this.rejectNamesFiltered = data;
      if (rejectName) {
        const rejectIdx: number = this.rejectNamesFiltered.findIndex(o => o.value.toString() === rejectName.toString());
        if (rejectIdx === -1 && this.form && this.form.get('rejectName')) {
          this.form.patchValue({
            rejectName: ''
          });
        }
      }

      this.categories = this.request.categories;
      this.faCodes = this.request.facodes;
      this.materialTypes = this.request.materialTypes;
      this.isAcknowledge = this.request.isAcknowledge;
      this.isDispositionAll = this.request.isDispositionAll;
      this.isDraft = this.request.isDraft;
      this.isFinal = this.request.isFinal;
      this.isInProcess = this.request.isInProcess;
      this.isMaterial = this.request.isMaterial;
      this.isOnHold = this.request.isOnHold;
      this.isOwner = this.request.isOwner;
      this.isPreviousProcess = this.request.isPreviousProcess;
      this.isRequest = this.request.isRequest;
      this.isRequestor = this.request.isRequestor;
      this.isSubmit = this.request.isSubmit;
      this.isWafer = this.request.isWafer;
      this.isMember = this.request.isMember;
      this.isEditingBy = this.request.isEditingBy;
      this.notFinalAndWafer = this.request.notFinalAndWafer;
      this.submit = this.request.submit;
      if (this.request.problemType !== this.problemType) {
        this.problemType = this.request.problemType;
        this.onTypeChange(this.problemType);
      }
      if (this.request.problemType && this.request.mfg !== this.mfg) {
        this.mfg = this.request.mfg;
        this.onTypeChange(this.problemType);
      }

      if (this.id !== this.request.id) {
        // On detail page
        this.id = this.request.id;
        this.form.patchValue(this.request);
        if (!this.isDraft) {
          this.disable('form', 'ownerMaterial');
        }
        this.attachFiles = this.form.get('attachFiles') as FormArray;
        const attachFiles = this.request.files ? this.request.files.filter(obj => obj.formName === 'D2') : [];
        for (let i = 0; i < attachFiles.length; i++) {
          this.attachFiles.push(
            this.fb.group({
              id: attachFiles[i].id,
              fileName: attachFiles[i].fileName,
              ncrbid: this.request.id,
              formName: 'D2'
            })
          );
        }
        this.onCategoryChange();
      } else {
        this.form.patchValue(this.request);
        if (this.request.category) {
          this.form.get('category').patchValue(this.request.category);
        }
        if (this.request.spec) {
          this.form.get('spec').patchValue(this.request.spec);
        }
        if (this.request.faCode) {
          this.form.get('faCode').patchValue(this.request.faCode);
        }
      }

      this.form.enable();
      this.onOperatorEnable();

      // Draft and no permission
      if (!this.isRequestor && this.isDraft) {
        this.form.disable();
      }

      // Other user editing
      if (this.id && !this.isEditingBy) {
        this.form.disable();
      }

      // Requested and not owner
      if (!this.isOwner && this.isRequest) {
        this.form.disable();
      }

      // Acknowledged
      if (this.isAcknowledge) {
        // this.form.disable();
      }

      // Submitted
      if (this.isSubmit) {
        this.form.disable();
      }

      // Merged
      if (this.request.isMerged) {
        this.form.disable();
      }

      this.form.updateValueAndValidity();
    });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D2') === -1;
        this.toggleCollapse.emit(this.collapse);
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.paramsSub.unsubscribe();
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

    this.form.addControl('attachFiles', this.fb.array([]));
    this.attachFiles = this.form.get('attachFiles') as FormArray;
  }
  async onRejectNameChange(event?) {
    if (event && typeof event !== 'object') {
      if (this._rejectName !== event) {
        this.request.rejectName = this.form.get('rejectName').value;
        this.request = Object.assign({}, this.request);
        this.loading = true;
        try {
          let res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
          if (res.status === 200 && res.data) {
            const score: Score = Object.assign({}, res.data);
            res = await this.dropdown.getDropdownRejectById(this.request.rejectName, true).toPromise();
            console.log(res.data);
            if (res.status === 200 && res.data) {
              if (this.request.category) {
                this.form.get('category').patchValue(this.request.category);
              } else {
                this.form.get('category').patchValue(res.data.category);
              }
              if (res.data.faCode > -1) {
                this.form.get('faCode').patchValue(res.data.faCode);
              }
              if (this.form.get('spec')) {
                if (this.request.spec) {
                  this.form.get('spec').patchValue(this.request.spec);
                } else {
                  this.form.get('spec').patchValue(res.data.spec);
                }
              }
              this.store.dispatch(setscore(score));
              this.onChange();
              await this.onFaCodeChange(true);
              this.onCategoryChange(res.data.category);
            }
          }
        } catch (ex) {
          // On Crashed
          console.error('D2 (Reject Name Change) Errors: ', ex);
        } finally {
          this.loading = false;
        }

        this._rejectName = event;
      }
    } else {
      this.form.get('category').patchValue('');
      // this.form.get('faCode').patchValue('');
      if (this.form.get('spec')) {
        this.form.get('spec').patchValue('');
      }
    }
  }
  async onMaterialTypeChange(event?) {
    if (typeof event !== 'object') {
      this.request.materialType = parseInt(this.form.get('materialType').value, 10);
      this.request = Object.assign({}, this.request);
      this.loading = true;
      try {
        let res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
        if (res.status === 200 && res.data) {
          const score: Score = Object.assign({}, res.data);
          res = await this.dropdown.getDropdownMaterialById(this.request.materialType).toPromise();
          if (res.status === 200 && res.data) {
            if (this.request.category) {
              this.form.get('category').patchValue(this.request.category);
            } else {
              this.form.get('category').patchValue(res.data.category);
            }
            this.store.dispatch(setscore(score));
            this.store.dispatch(setscoreold(score));
            this.onChange();
            this.onCategoryChange(res.data.category);
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('D2 (Material Type Change) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }
  onCategoryChange(event?) {
    this.onChange();
    this.onOperatorEnable();
    if (event) {
      this.cdr.detectChanges();
    }
  }
  onOperatorEnable() {
    if (
      this.form.get('category') &&
      this.form.get('category').value &&
      this.form.get('category').value.toString() === '682'
    ) {
      if (this.form.get('operatorId')) {
        this.form.get('operatorId').patchValue(this.request.operatorId);
        this.enable('form', 'operatorId');
      }
    } else {
      if (this.form.get('operatorId')) {
        this.form.get('operatorId').patchValue('');
        this.disable('form', 'operatorId');
      }
    }
  }
  async onFaCodeChange(event?) {
    const rejectNames = JSON.parse(localStorage.getItem('rejectNames')).filter(
      o => o.mfg.toString() === this.request.mfg.toString() && o.subMfg.toString() === this.request.subMfg.toString()
    );
    // const rejectNames = (await this.dropdown.getDropdownReject().toPromise()).data;
    if (event && typeof event !== 'object') {
      if (this._facode !== event) {
        let result = rejectNames;
        if (this.form.get('faCode').value !== '') {
          result = rejectNames.filter(o => o.faCode.toString() === this.form.get('faCode').value.toString());
        }
        this.rejectNamesFiltered = result.map(o => {
          return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
        });
        if (this.rejectNamesFiltered.length > 1) {
          const idx = this.rejectNamesFiltered.findIndex(
            r => r.value.toString() === this.form.get('rejectName').value.toString()
          );
          if (idx === -1) {
            this.form.get('rejectName').patchValue('');
          }
          this.form.get('rejectName').updateValueAndValidity();
        } else if (this.rejectNamesFiltered.length === 1) {
          console.log('RejectName: ', this.form.get('rejectName').value);
          if (this.form.get('rejectName').value) {
          } else {
            this.form.get('rejectName').patchValue(this.rejectNamesFiltered[0].value);
            this.request.rejectName = this.form.get('rejectName').value;
            this.request = Object.assign({}, this.request);
            this.loading = true;
            try {
              let res: ResponseObj = await this.ajax.getCalculateScore(this.request).toPromise();
              if (res.status === 200 && res.data) {
                const score: Score = Object.assign({}, res.data);
                res = await this.dropdown.getDropdownRejectById(this.request.rejectName, true).toPromise();
                if (res.status === 200 && res.data) {
                  if (this.request.category) {
                    this.form.get('category').patchValue(this.request.category);
                  } else {
                    this.form.get('category').patchValue(res.data.category);
                  }
                  if (this.form.get('spec')) {
                    if (this.request.spec) {
                      this.form.get('spec').patchValue(this.request.spec);
                    } else {
                      this.form.get('spec').patchValue(res.data.spec);
                    }
                  }
                  this.store.dispatch(setscore(score));
                  this.onChange();
                  this.onCategoryChange(res.data.category);
                }
              }
            } catch (ex) {
              // On Crashed
              console.error('D2 (FA Code Change) Errors: ', ex);
            } finally {
              this.loading = false;
            }
          }
        } else {
          // this.rejectNamesFiltered = rejectNames.slice().map(o => {
          //   return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
          // });
          this.form.get('category').patchValue('');
          this.form.get('rejectName').patchValue('');
          if (this.form.get('spec')) {
            this.form.get('spec').patchValue('');
          }
        }

        this._facode = event;
      }
    } else {
      this.rejectNamesFiltered = rejectNames.slice().map(o => {
        return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
      });
      if (this.form.get('category') && !this.form.get('category').value) {
        this.form.get('category').patchValue('');
      }
      if (this.form.get('rejectName') && !this.form.get('rejectName').value) {
        this.form.get('rejectName').patchValue('');
      }
      if (this.form.get('spec') && !this.form.get('spec').value) {
        this.form.get('spec').patchValue('');
      }
    }
  }
  async downloadFile(idx: number) {
    const attachFile: FileObj = this.attachFiles.getRawValue()[idx];
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'D2 File View NCRB',
        folders: [this.request.id.toString(), 'D2'],
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
  async selectFile(event) {
    try {
      if (event.target.files.length > 0) {
        for (let i = 0; i < event.target.files.length; i++) {
          // if (this.lessThanLimit(event.target.files[0].size)) {
          const formData = new FormData();
          formData.append('file', event.target.files[i], `${this.request.id}/D2/${event.target.files[i].name}`);
          if (this.id) {
            const response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
            this.attachFiles = this.form.get('attachFiles') as FormArray;
            this.attachFiles.push(
              this.fb.group({
                id: response.data.id,
                fileName: response.data.fileName,
                ncrbno: this.request.ncnumber,
                formName: 'D2'
              })
            );
          } else {
            this.attachFiles = this.form.get('attachFiles') as FormArray;
            this.attachFiles.push(
              this.fb.group({
                id: null,
                fileName: `${this.request.id}/D2/${event.target.files[i].name}`,
                fileNameTemp: event.target.files[i].name,
                ncrbno: null,
                formName: 'D2',
                file: event.target.files[i]
              })
            );
          }
          this.onChange();
          // } else {
          //   alertWarning('Please upload file less than 10 MB');
          // }
        }
      }
    } catch (ex) {
      console.error('D2 (Upload File) Errors: ', ex);
    }
  }
  removeFile(idx: number) {
    alertConfirm('Make sure, Do you want to delete file ?', 'Are you sure ?', async result => {
      if (result) {
        try {
          const file = (this.attachFiles.at(idx) as FormGroup).getRawValue();
          const response: ResponseObj = await this.ajax
            .removeFiles(file.id, file.ncrbid, file.formName, file.fileName)
            .toPromise();
          if (response.status === 200) {
            this.attachFiles.removeAt(idx);
            this.onChange();
            alertSuccess();
          }
        } catch (ex) {
          console.error('On Remove (D2): ', ex);
        }
      }
    });
  }
  onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    // On Everything Change
    this.request = Object.assign(this.request, this.form.getRawValue());
    const obj: any = this.form.getRawValue();
    Object.keys(obj).forEach((objectKey, index) => {
      if (obj[objectKey] && typeof obj[objectKey] === 'string' && obj[objectKey].trim() === '') {
        this.form.get(objectKey).patchValue('');
      }
    });
    this.onOperatorEnable();
    this.request.d2Valid = this.form.valid;
    if (!this.form.valid) {
      console.log('ownerMaterial: ', this.request.ownerMaterial);
      const keys = Object.keys(this.form.getRawValue());
      for (let i = 0; i < keys.length; i++) {
        if (this.form.get(keys[i]).invalid) {
          console.log(keys[i] + ' required...');
        }
      }
    }
    console.log('SubMfg: ', this.request.subMfg);
    this.store.dispatch(setrequest(this.request));
  }
  /* Forms Event */

  /* Select Process */
  private getSize(sizeinbytes: number): string {
    const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
    let fSize = sizeinbytes;
    let i = 0;
    while (fSize > 900) {
      fSize /= 1024;
      i++;
    }
    return Math.round(fSize * 100) / 100 + ' ' + fSExt[i];
  }
  private lessThanLimit(sizeinbytes: number): boolean {
    const size: string = this.getSize(sizeinbytes);
    if (
      (size.split(' ')[1] === 'MB' && parseInt(size.split(' ')[0], 10) <= 9.99) ||
      size.split(' ')[1] === 'KB' ||
      size.split(' ')[1] === 'Bytes'
    ) {
      return true;
    }
    return false;
  }
  private onMaterial(): void {
    // Prepare for patch value `owner material`
    let ownerMaterial: string = '';
    const idx: number = this.params.findIndex(obj => obj.label === 'OWNER_MATERIAL');
    if (idx > -1) {
      ownerMaterial = this.params[idx].value;
    }

    const controls = [
      { name: 'attachFile', required: false, value: '' },
      { name: 'attachFiles', required: false, value: '' },
      { name: 'category', required: true, value: '' },
      { name: 'faCode', required: false, value: '' },
      { name: 'materialType', required: true, value: '' },
      { name: 'ownerMaterial', required: true, value: ownerMaterial },
      { name: 'rejectDetail', required: true, value: '' }
    ];
    this.addControls(controls);
  }
  private onInProcess(): void {
    const controls = [
      { name: 'attachFile', required: false, value: '' },
      { name: 'category', required: true, value: '' },
      { name: 'faCode', required: false, value: '' },
      { name: 'operatorId', required: true, value: '' },
      { name: 'rejectDetail', required: false, value: '' },
      { name: 'rejectName', required: true, value: '' },
      { name: 'materialType', required: false, value: '' },
      { name: 'spec', required: true, value: '' }
    ];
    this.addControls(controls);
  }
  private onPreviousProcess(): void {
    const controls = [
      { name: 'attachFile', required: false, value: '' },
      { name: 'category', required: true, value: '' },
      { name: 'faCode', required: false, value: '' },
      { name: 'operatorId', required: false, value: '' },
      { name: 'rejectDetail', required: false, value: '' },
      { name: 'rejectName', required: true, value: '' },
      { name: 'materialType', required: false, value: '' },
      { name: 'spec', required: true, value: '' }
    ];
    if (this.request.mfg.toString() === '10') {
      this.addControls(controls.concat([{ name: 'ownerMaterial', required: true, value: '' }]));
    } else {
      this.addControls(controls);
    }
  }
  onOnHold(): void {
    const controls = [
      { name: 'attachFile', required: false, value: '' },
      { name: 'category', required: true, value: '' },
      { name: 'faCode', required: false, value: '' },
      { name: 'operatorId', required: true, value: '' },
      { name: 'rejectDetail', required: false, value: '' },
      { name: 'rejectName', required: true, value: '' },
      { name: 'materialType', required: false, value: '' },
      { name: 'spec', required: true, value: '' }
    ];
    this.addControls(controls);
  }
  onRemove(form: string = 'form'): void {
    const controls = [
      /* section 1 */
      { name: 'attachFile', section: 'form' },
      { name: 'category', section: 'form' },
      { name: 'faCode', section: 'form' },
      { name: 'materialType', section: 'form' },
      { name: 'operatorId', section: 'form' },
      { name: 'ownerMaterial', section: 'form' },
      { name: 'rejectDetail', section: 'form' },
      { name: 'rejectName', section: 'form' },
      { name: 'spec', section: 'form' }
      /* section 1 */
    ];
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
  private o2null(num: number): number {
    return num === 0 ? null : num;
  }
  /* Controls Management */

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D2').value : 'Loading';
  }
}
