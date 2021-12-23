import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant } from '../../../constants';
import { FileObj, IStatus, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertWarning, filterByName } from '../../../utils';

@Component({
  selector: 'app-d4',
  templateUrl: './d4.component.html'
})
export class D4Component extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ncrbid: number = 0;
  @Input() ncrbno: string = '';
  @Output() d4: EventEmitter<boolean> = new EventEmitter<boolean>();
  formContain: FormGroup;
  submitContain: boolean = false;
  dateConstant: DateConstant = new DateConstant();
  date: Date = new Date();
  filter = filterByName;
  isD12D83x5Why: boolean = false;
  iStatusSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  userSub: any = null;
  user: User = null;
  loading: boolean = false;
  processing: boolean = false;
  collapse: boolean = false;
  routeSub: any;
  bsModalRef: BsModalRef;
  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private store: Store<IAppState>,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d4');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.formContain = this.fb.group({
      id: [null],
      ncrbno: [null],
      rootCause: [null, Validators.required],
      escapePoint: [null, Validators.required],
      attachFile: this.fb.group({
        id: null,
        formName: '',
        fileName: '',
        ncrbid: null,
        file: null
      }),
      attach3x5Why: this.fb.group({
        id: null,
        formName: '',
        fileName: '',
        ncrbid: null,
        file: null
      }),
      createdBy: [null],
      createdDate: [null]
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
    });
    this.iStatusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      this.isD12D83x5Why = status.isD12D83x5Why;
      if (this.isD12D83x5Why) {
        this.formContain.get('attach3x5Why').setValidators([Validators.required]);
        this.formContain.get('attach3x5Why').updateValueAndValidity();
      }
    });
  }

  async ngOnInit() {
    if (this.ncrbno) {
      this.loading = true;
      try {
        const response: ResponseObj = await this.ajax.getFailureEscape(this.ncrbno).toPromise();
        if (response.status === 200 && response.data) {
          const fileEmpty = {
            id: null,
            formName: '',
            fileName: '',
            ncrbid: null,
            file: null
          };
          if (!response.data.attachFile) {
            response.data.attachFile = fileEmpty;
          }
          if (!response.data.attach3x5Why) {
            response.data.attach3x5Why = fileEmpty;
          }
          this.formContain.patchValue(response.data);
          if (response.data.id) {
            this.d4.emit(true);
            this.formContain.disable();
          } else {
            this.formContain.enable();
          }
        }
      } catch (ex) {
        console.error('D4 (Initial) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D4') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  async selectFileContain(event, control) {
    try {
      const form: string = 'formContain';
      this.processing = true;
      if (this[form].get(control).value) {
        let response: ResponseObj = await this.ajax.removeFile(this[form].get(control).value).toPromise();
        if (event.target.files[0]) {
          if (this.lessThanLimit(event.target.files[0].size)) {
            const formData = new FormData();
            formData.append('file', event.target.files[0], `${this.ncrbid}/D4/${event.target.files[0].name}`);
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
            formData.append('file', event.target.files[0], `${this.ncrbid}/D4/${event.target.files[0].name}`);
            const response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
            this[form].get(control).patchValue(response.data);
            this.d4.emit(true);
          } else {
            alertWarning('Please upload file less than 10 MB');
          }
        }
      }
    } catch (ex) {
      console.error('D4 (Select File) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.processing = false;
      }, 50);
    }
  }

  async downloadFile(control: string) {
    const attachFile: FileObj = this.formContain.getRawValue()[control];
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'D4 file view',
        folders: [this.ncrbid.toString(), 'D4'],
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
      alertConfirm('This process will take a long time.', 'Are you sure ?', async rs => {
        if (rs.value) {
          this.loading = true;
          if (this.user) {
            this.formContain.patchValue({ createdBy: this.user.name, createdDate: new Date(), ncrbno: this.ncrbno });
          }
          try {
            const response: ResponseObj = await this.ajax.saveFailureEscape(this.formContain.getRawValue()).toPromise();
            if (response.status === 200) {
              console.log(response.data);
              this.formContain.patchValue(response.data);
            }
          } catch (ex) {
            console.error('D4 (Submit) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.loading = false;
            }, 50);
          }
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
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D4').value : 'Loading';
  }
}
