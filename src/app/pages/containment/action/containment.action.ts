import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { ModalDetailComponent } from '../../../components/modal-detail/modal-detail.component';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant } from '../../../constants';
import { FileObj, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, alertWarning } from '../../../utils';

@Component({
  selector: 'app-containment-action',
  templateUrl: './containment.action.html'
})
export class ContainmentActionComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  dateConstant: DateConstant = new DateConstant();
  user: User = null;
  userSub: any = null;
  actionOwners: FormArray;
  actionDrivers: FormArray;
  attachFiles: FormArray;
  public minDate: Date = null;
  public maxDate: Date = null;
  public loading: boolean = true;
  public submit: boolean = false;
  private bsModalRef: BsModalRef = null;
  constructor(
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private ajax: AjaxService,
    private fb: FormBuilder,
    private router: Router,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('containment/action/');

    this.form = this.fb.group({
      ncrbid: [null],
      ncrbno: [null],
      actionId: [null],
      owner: [null],
      actionDetail: [null, Validators.required],
      actionDetailOwner: [null, Validators.required],
      actionDriver: [null, Validators.required],
      actionOwner: [null, Validators.required],
      actionType: [{ value: 'IA', disabled: true }, Validators.required],
      targetDateOld: [new Date()],
      targetDate: [new Date(), Validators.required],
      postponeDate: [{ value: null, disabled: true }],
      priority: [false, Validators.required],
      status: [null],
      actionDrivers: this.fb.array([]),
      actionOwners: this.fb.array([]),
      attachFiles: this.fb.array([])
    });
    this.actionOwners = this.form.get('actionOwners') as FormArray;
    this.actionDrivers = this.form.get('actionDrivers') as FormArray;
    this.attachFiles = this.form.get('attachFiles') as FormArray;
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
        console.error('Containment Action (Prepare data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  async getData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // TODO
      try {
        this.loading = true;
        const response: ResponseObj = await this.ajax.getContainmentActionCaById(id).toPromise();
        if (response.status === 200 && response.data) {
          this.form.disable();
          if (response.data.postponeDate) {
            response.data.postponeDate = moment(response.data.postponeDate).toDate();
          }
          response.data.targetDateOld = moment(response.data.targetDate).toDate();
          response.data.targetDate = response.data.targetDateOld;
          this.form.patchValue(response.data);
          if (
            ((this.isDriver || this.isOwner || this.isNCRBOwner) &&
              response.data.status === 'PENDING' &&
              this.isEsTime) ||
            (this.isOwner && response.data.status === 'PENDING')
          ) {
            this.form.get('targetDate').enable();
            this.minDate = moment(response.data.targetDate)
              .add(1, 'days')
              .toDate();
            this.maxDate = moment(response.data.targetDate)
              .add(3, 'days')
              .toDate();
            this.form.get('actionDetailOwner').enable();
            response.data.actionDetailOwner = response.data.actionDetail;
          } else if (this.isDriver && response.data.status === 'ACKNOWLEDGE') {
            this.minDate = moment(response.data.targetDate)
              .add(1, 'days')
              .toDate();
            this.maxDate = moment(response.data.targetDate)
              .add(3, 'days')
              .toDate();
          } else {
            this.form.disable();
          }
          if (this.actionOwners.getRawValue().length !== response.data.actionOwners.length) {
            for (let i = 0; i < response.data.actionOwners.length; i++) {
              const { actionOwner, supervisorId, wbi } = response.data.actionOwners[i];
              this.addOwner(response.data.actionOwners[i].id, actionOwner, supervisorId, wbi);
            }
          }
          if (this.actionDrivers.getRawValue().length !== response.data.actionDrivers.length) {
            for (let i = 0; i < response.data.actionDrivers.length; i++) {
              const { actionDriver, supervisorId, wbi } = response.data.actionDrivers[i];
              this.addDriver(response.data.actionDrivers[i].id, actionDriver, supervisorId, wbi);
            }
          }
          if (this.attachFiles.getRawValue().length !== response.data.attachFiles.length) {
            for (let i = 0; i < response.data.attachFiles.length; i++) {
              const { formName, fileName, ncrbid } = response.data.attachFiles[i];
              this.addFiles(response.data.attachFiles[i].id, formName, fileName, ncrbid);
            }
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Containment Action (Prepare data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async selectFile(event) {
    try {
      if (event.target.files.length > 0) {
        for (let i = 0; i < event.target.files.length; i++) {
          // if (this.lessThanLimit(event.target.files[0].size)) {
          const form = this.form.getRawValue();
          const formData = new FormData();
          formData.append(
            'file',
            event.target.files[i],
            `${form.ncrbid}/D3ADD/${event.target.files[i].name}/${form.actionId}`
          );
          if (form.ncrbid) {
            const response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
            this.attachFiles = this.form.get('attachFiles') as FormArray;
            this.attachFiles.push(
              this.fb.group({
                id: response.data.id,
                fileName: response.data.fileName,
                specId: form.actionId,
                ncrbno: form.ncrbno,
                formName: 'D3ADD'
              })
            );
          } else {
            this.attachFiles = this.form.get('attachFiles') as FormArray;
            this.attachFiles.push(
              this.fb.group({
                id: null,
                fileName: `${form.ncrbid}/D3ADD/${event.target.files[i].name}`,
                fileNameTemp: event.target.files[i].name,
                ncrbno: null,
                formName: 'D3ADD',
                file: event.target.files[i]
              })
            );
          }
        }
      }
    } catch (ex) {
      console.error('D3 (Upload File) Errors: ', ex);
    }
  }
  downloadFile(idx: number) {
    const form = this.form.getRawValue();
    const attachFile: FileObj = this.attachFiles.getRawValue()[idx];
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'NCRB Containment Action File View',
        folders: [form.ncrbid.toString(), 'D3ADD'],
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
            alertSuccess();
          }
        } catch (ex) {
          console.error('On Remove (D3): ', ex);
        }
      }
    });
  }

  async onComplete() {
    if (!this.user || this.user?.empId === 'empId') {
      alertWarning(`<p>Please login to proceed this process..</p>`);
      return;
    }
    if (!this.isOwner && !this.isEsTime && !this.isNCRBOwner) {
      alertWarning(`<p>This account no permission to proceed this process..</p>`);
      return;
    }
    const result = await alertConfirm('This process will send complete to `Action owner`.');
    if (result.value) {
      const id = this.route.snapshot.paramMap.get('id');
      const auth: string = localStorage.getItem('basic_auth');
      try {
        this.loading = true;
        let response: ResponseObj = await this.ajax.getContainmentComplete(parseInt(id, 10), auth).toPromise();
        if (response.status === 200 && response.data) {
          response = await this.ajax.updateContainmentAction(this.form.getRawValue()).toPromise();
          if (response.status === 200 && response.data) {
            this.form.disable();
            this.form.get('status').patchValue('COMPLETE');
            alertSuccess();
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Containment Action (Complete) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async onPostpone() {
    if (!this.user || this.user?.empId === 'empId') {
      alertWarning(`<p>Please login to proceed this process..</p>`);
      return;
    }
    if (!this.isOwner && !this.isEsTime && !this.isNCRBOwner) {
      alertWarning(`<p>This account no permission to proceed this process..</p>`);
      return;
    }
    const result = await alertConfirm('This process will send postpone to `Action owner`.');
    if (result.value) {
      const id = this.route.snapshot.paramMap.get('id');
      const auth: string = localStorage.getItem('basic_auth');
      try {
        this.loading = true;
        let response: ResponseObj = await this.ajax.getContainmentPostpone(parseInt(id, 10), auth).toPromise();
        if (response.status === 200 && response.data) {
          this.form.get('postponeDate').patchValue(this.form.get('targetDate').value);
          this.form.get('targetDate').patchValue(this.form.get('targetDateOld').value);
          response = await this.ajax.updateContainmentAction(this.form.getRawValue()).toPromise();
          if (response.status === 200 && response.data) {
            this.form.disable();
            this.form.get('status').patchValue('POSTPONE');
            alertSuccess();
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Containment Action (Postpone) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async onPostponeApprove() {
    if (!this.user || this.user?.empId === 'empId') {
      alertWarning(`<p>Please login to proceed this process..</p>`);
      return;
    }
    if (!this.isDriver && !this.isEsTime && !this.isNCRBOwner) {
      alertWarning(`<p>This account no permission to proceed this process..</p>`);
      return;
    }
    const result = await alertConfirm('This process will approve postpone.');
    if (result.value) {
      const id = this.route.snapshot.paramMap.get('id');
      const auth: string = localStorage.getItem('basic_auth');
      try {
        this.loading = true;
        let response: ResponseObj = await this.ajax.getContainmentPostponeApprove(parseInt(id, 10), auth).toPromise();
        if (response.status === 200 && response.data) {
          this.form.get('targetDate').patchValue(this.form.get('postponeDate').value);
          response = await this.ajax.updateContainmentAction(this.form.getRawValue()).toPromise();
          if (response.status === 200 && response.data) {
            this.form.disable();
            this.form.get('status').patchValue('PENDING');
            alertSuccess();
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Containment Action (Postpone) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  async onPostponeReject() {
    if (!this.user || (this.user && this.user?.empId === 'empId')) {
      alertWarning(`<p>Please login to proceed this process..</p>`);
      return;
    }
    if (!this.isDriver && !this.isEsTime && !this.isNCRBOwner) {
      alertWarning(`<p>This account no permission to proceed this process..</p>`);
      return;
    }
    const result = await alertConfirm('This process will reject postpone.');
    if (result.value) {
      const id = this.route.snapshot.paramMap.get('id');
      const auth: string = localStorage.getItem('basic_auth');
      try {
        this.loading = true;
        let response: ResponseObj = await this.ajax.getContainmentPostponeReject(parseInt(id, 10), auth).toPromise();
        if (response.status === 200 && response.data) {
          this.form.get('targetDate').patchValue(this.form.get('targetDateOld').value);
          response = await this.ajax.updateContainmentAction(this.form.getRawValue()).toPromise();
          if (response.status === 200 && response.data) {
            this.form.disable();
            this.form.get('status').patchValue('PENDING');
            alertSuccess();
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Containment Action (Postpone) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  onResetTargetDate() {
    this.form.get('targetDate').patchValue(this.form.get('targetDateOld').value);
  }

  addOwner(id, actionOwner, supervisorId, wbi): void {
    this.actionOwners = this.form.get('actionOwners') as FormArray;
    this.actionOwners.push(
      this.fb.group({
        id: [id],
        actionOwner: [actionOwner, Validators.required],
        supervisorId: [supervisorId],
        role: ['OWNER', Validators.required],
        wbi: [wbi]
      })
    );
  }

  addDriver(id, actionDriver, supervisorId, wbi): void {
    this.actionDrivers = this.form.get('actionDrivers') as FormArray;
    this.actionDrivers.push(
      this.fb.group({
        id: [id],
        actionDriver: [actionDriver, Validators.required],
        supervisorId: [supervisorId],
        role: ['DRIVER', Validators.required],
        wbi: [wbi]
      })
    );
  }

  addFiles(id, formName, fileName, ncrbid): void {
    this.attachFiles = this.form.get('attachFiles') as FormArray;
    this.attachFiles.push(
      this.fb.group({
        id: [id],
        formName: [formName, Validators.required],
        fileName: [fileName],
        ncrbid: [ncrbid]
      })
    );
  }

  public onNcrbDetail(ncrbid: number) {
    const id = ncrbid; // <=== ncrbid here
    this.bsModalRef = this.modalService.show(ModalDetailComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        id: id
      }
    });
    this.bsModalRef.content.event.subscribe(fullmode => {
      try {
        if (fullmode) {
          this.bsModalRef.hide();
          this.router.navigate(['/requests/detail/' + id]);
        }
      } catch (ex) {
        console.error(ex);
      }
    });
  }

  get isNCRBOwner() {
    return this.user?.username === this.form.getRawValue().owner;
  }

  get isOwner() {
    if (this.user && this.user?.empId !== 'empId') {
      const index: number = this.form.getRawValue().actionOwners.findIndex(
        obj =>
          obj.actionOwner
            .split(' ')[0]
            .trim()
            .toUpperCase() === this.user.empId.trim().toUpperCase()
      );
      return index > -1;
    }
    return false;
  }

  get isDriver() {
    if (this.user && this.user?.empId !== 'empId') {
      const index: number = this.form.getRawValue().actionDrivers.findIndex(
        obj =>
          obj.actionDriver
            .split(' ')[0]
            .trim()
            .toUpperCase() === this.user.empId.trim().toUpperCase()
      );
      return index > -1;
    }
    return false;
  }

  get isPostpone() {
    return this.form.getRawValue().status === 'POSTPONE';
  }

  get isEsTime() {
    const targetDate: number = parseInt(moment(this.form.getRawValue().targetDate).format('YYYYMMDD'), 10);
    const currentDate: number = parseInt(moment(new Date()).format('YYYYMMDD'), 10);
    return (
      targetDate <= currentDate &&
      this.form.getRawValue().status !== 'NEW' &&
      this.form.getRawValue().status !== 'POSTPONE'
    );
  }

  get isTargetDateChange() {
    const targetDate: number = parseInt(moment(this.form.getRawValue().targetDate).format('YYYYMMDD'), 10);
    const targetDateOld: number = parseInt(moment(this.form.getRawValue().targetDateOld).format('YYYYMMDD'), 10);
    return targetDate !== targetDateOld;
  }
}
