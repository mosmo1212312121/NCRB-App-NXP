import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from '../../../components';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant, Status } from '../../../constants';
import { ContainmentAction, FileObj, Initial, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService, MessageService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, alertWarning, filterByName } from '../../../utils';

@Component({
  selector: 'app-d3',
  templateUrl: './d3.component.html'
})
export class D3Component extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ncrbid: number = null;
  @Input() ncrbno: string = '';
  @Input() status: string = '';
  @Output() submit: EventEmitter<ContainmentAction[]> = new EventEmitter<ContainmentAction[]>();
  formContain: FormGroup;
  submitContain: boolean = false;
  dateConstant: DateConstant = new DateConstant();
  date: Date = new Date();
  filter = filterByName;
  d3RCs: ContainmentAction[] = [];
  Status: Status = new Status();
  user: User = null;
  userSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  loading: boolean = false;
  processing: boolean = false;
  bsModalRef: BsModalRef;

  isSubmit: boolean = false;
  isSw1: boolean = false;
  isSw2: boolean = false;

  collapse: boolean = false;
  routeSub: any;
  messageSub: any;
  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private router: Router,
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private logService: LogService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      this.isSubmit = request.isSubmit;
      this.isSw1 = request.isSw1;
      this.isSw2 = request.isSw2;
      if (this.request.isMerged) {
        if (this.formContain) {
          this.formContain.disable();
        }
      }
    });
    this.formContain = this.fb.group({
      id: [null],
      rootCause: [null, Validators.required],
      rootCauseAttach: this.fb.group({
        id: null,
        formName: '',
        fileName: '',
        ncrbid: null,
        file: null
      }),
      correction: [null, Validators.required],
      correctionAttach: this.fb.group({
        id: null,
        formName: '',
        fileName: '',
        ncrbid: null,
        file: null
      }),
      addonsNote: [null],
      responsePerson: [null, Validators.required],
      actionDate: [new Date(), Validators.required],
      actionTime: [null]
    });
  }

  ngOnInit(): void {
    if (this.ncrbno) {
      this.loading = true;

      // get containment action with realtime
      // this.messageSub = this.messageService.getMessage(`D3_1?ncrbno=${this.ncrbno}&section=RC`).subscribe(result => {
      //   const containments: any[] = JSON.parse(result).data;
      //   if (containments.length > 0) {
      //     let changed: boolean = false;
      //     containments.map(obj => {
      //       if (obj.date) {
      //         obj.actionDate = moment(obj.date).format('DD MMM YYYY');
      //       } else {
      //         obj.actinDate = null;
      //       }
      //       return obj;
      //     });

      //     // checking data was changed
      //     if (containments.length !== this.d3RCs.length) {
      //       changed = true;
      //     } else if (containments.length > 0 && containments.length === this.d3RCs.length) {
      //       const keys: string[] = Object.keys(containments[0]);
      //       for (let i = 0; i < containments.length; i++) {
      //         for (let j = 0; j < keys.length; j++) {
      //           if (keys[j] !== 'rootCauseAttach' && keys[j] !== 'correctionAttach' && keys[j] !== 'date') {
      //             if (containments[i][keys[j]] !== this.d3RCs[i][keys[j]]) {
      //               console.log(keys[j], containments[i][keys[j]], this.d3RCs[i][keys[j]]);
      //               changed = true;
      //               break;
      //             }
      //           }
      //         }
      //       }
      //     } else {
      //       changed = false;
      //     }

      //     // update when was changed
      //     if (changed) {
      //       this.toastrService
      //         .success(this.title + ' was updated', 'Update Notification', {
      //           progressAnimation: 'decreasing',
      //           progressBar: true,
      //           timeOut: 3000
      //         })
      //         .onHidden.toPromise();
      //       this.d3RCs = containments.slice();
      //       this.submit.emit(this.d3RCs);
      //       changed = false;
      //     }
      //   }
      // });

      // get containment action with normal
      this.ajax.getContainmentAction(this.ncrbno, 'RC').subscribe(response => {
        if (response.data.length > 0) {
          response.data.map(obj => {
            obj.actionDate = moment(obj.date as Date).format('DD MMM YYYY');
          });
          this.d3RCs = response.data;
          this.submit.emit(this.d3RCs);
        } else {
          if (this.user && this.user.empId.toUpperCase() !== 'empId'.toUpperCase()) {
            this.formContain.get('responsePerson').patchValue(this.user.name);
          }
        }
        this.loading = false;
        if (this.request.isMerged) {
          this.formContain.disable();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D3') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    // this.messageSub.unsubscribe();
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
  }

  async selectFileContain(event, control) {
    try {
      const form: string = 'formContain';
      this.processing = true;
      if (this[form].get(control).value) {
        const fileObj: FileObj = this[form].get(control).value;
        let response: ResponseObj = await this.ajax
          .removeFiles(fileObj.id, fileObj.ncrbid, fileObj.formName, fileObj.fileName)
          .toPromise();
        if (event.target.files[0]) {
          if (this.lessThanLimit(event.target.files[0].size)) {
            const formData = new FormData();
            formData.append('file', event.target.files[0], `${this.request.id}/D3/${event.target.files[0].name}`);
            response = await this.ajax.uploadFile(formData).toPromise();
            this[form].get(control).patchValue(response.data);
          } else {
            alertWarning('Please upload file less than 10 MB');
          }
        } else {
          this[form].get(control).patchValue('');
        }
      } else {
        if (event.target.files[0]) {
          if (this.lessThanLimit(event.target.files[0].size)) {
            const formData = new FormData();
            formData.append('file', event.target.files[0], `${this.request.id}/D3/${event.target.files[0].name}`);
            const response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
            this[form].get(control).patchValue(response.data);
          } else {
            alertWarning('Please upload file less than 10 MB');
          }
        }
      }
    } catch (ex) {
      console.error('D3 (Select file) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.processing = false;
      }, 50);
    }
  }

  async downloadFile(idx: number, attach: string) {
    const attachFile: FileObj = this.d3RCs[idx][`${attach}Attach`];
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'D3 file view',
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

  removeFile(form: string, control: string) {
    this.processing = true;
    this.ajax.removeFile(this[form].get(control).value).subscribe(response => {
      this[form].get(control).reset();
      setTimeout(() => {
        this.processing = false;
      }, 50);
    });
  }

  onSubmit(): void {
    this.submitContain = true;
    if (this.formContain.valid) {
      alertConfirm('This process will take a long time.', 'Are you sure ?', rs => {
        if (rs.value) {
          const data: ContainmentAction = this.formContain.getRawValue();
          const date = moment(this.formContain.getRawValue().actionDate);
          const time: string[] = this.formContain.getRawValue().actionTime
            ? this.formContain.getRawValue().actionTime.split(':')
            : date.format('HH:mm:ss').split(':');
          data.date = date.set({ hour: parseInt(time[0], 10), minute: parseInt(time[1], 10) }).toDate();
          this.processing = true;
          this.ajax.saveContainmentAction(this.ncrbno, data).subscribe(response => {
            this.formContain.reset();
            this.formContain.get('actionDate').patchValue(new Date());
            this.submitContain = false;
            // response.data.actionDate = dateTimeToDate(response.data.date) as Date;
            // response.data.actionDate = response.data.date;
            response.data.actionDate = moment(response.data.date).format('DD MMM YYYY');
            this.d3RCs.push(response.data);
            this.submit.emit(this.d3RCs);
            setTimeout(() => {
              this.processing = false;
            }, 50);
            alertSuccess(
              `
            <p>Submitted form D3 (Root cause) !</p>
            <span style="color: green; white-space: pre-line;">Successfully !</span>
            `,
              'Successful!',
              () => {
                this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
              }
            );
          });
        }
      });
    }
  }

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
    if ((size.split(' ')[1] === 'MB' && parseInt(size.split(' ')[0], 10) <= 9.99) || size.split(' ')[1] === 'KB') {
      return true;
    }
    return false;
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_1').value : 'Loading';
  }
}
