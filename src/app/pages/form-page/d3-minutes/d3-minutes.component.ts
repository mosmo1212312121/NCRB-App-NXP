import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from '../../../components';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant, Status } from '../../../constants';
import { FileObj, Initial, IStatus, Minute, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService, MessageService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, filterByName } from '../../../utils';
import { D3AddMomComponent } from './modals/add-mom.component';

@Component({
  selector: 'app-d3-minutes',
  templateUrl: './d3-minutes.component.html'
})
export class D3MinutesComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ncrbid: number = null;
  @Input() ncrbno: string = '';
  @Input() status: string = '';
  @Output() submit: EventEmitter<Minute[]> = new EventEmitter<Minute[]>();
  submitContain: boolean = false;
  dateConstant: DateConstant = new DateConstant();
  date: Date = new Date();
  filter = filterByName;
  Minutes: Minute[] = [];
  bsModalRef: BsModalRef;
  Status: Status = new Status();
  loading: boolean = false;
  processing: boolean = false;
  params: Parameter[] = [];
  paramsSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  user: User = null;
  userSub: any = null;
  _status: IStatus = null;
  statusSub: any = null;
  isSubmit: boolean = false;
  isSw1: boolean = false;
  isSw2: boolean = false;
  isOwner: boolean = false;
  collapse: boolean = false;
  routeSub: any;
  messageSub: any;
  constructor(
    private ajax: AjaxService,
    private modalService: BsModalService,
    private router: Router,
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private logService: LogService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-minutes');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      this.isSubmit = request.isSubmit;
      this.isSw1 = request.isSw1;
      this.isSw2 = request.isSw2;
      this.isOwner = request.isOwner;
    });
    this.statusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      this._status = status;
    });
  }

  async ngOnInit() {
    if (this.ncrbno) {
      this.loading = true;

      // get minutes with realtime
      // this.messageSub = this.messageService.getMessage(`MOMs?ncrbno=${this.ncrbno}`).subscribe(result => {
      //   const minutes: any[] = JSON.parse(result).data;
      //   if (minutes.length > 0) {
      //     let changed: boolean = false;
      //     minutes.map(obj => {
      //       if (obj.meetingDate) {
      //         obj.meetingDate = moment(obj.meetingDate).format('DD MMM YYYY');
      //       } else {
      //         obj.meetingDate = null;
      //       }
      //       return obj;
      //     });

      //     // checking data was changed
      //     if (minutes.length !== this.Minutes.length) {
      //       changed = true;
      //     } else if (minutes.length > 0 && minutes.length === this.Minutes.length) {
      //       const keys: string[] = Object.keys(minutes[0]);
      //       for (let i = 0; i < minutes.length; i++) {
      //         for (let j = 0; j < keys.length; j++) {
      //           if (keys[j] !== 'minuteFile' && keys[j] !== 'date') {
      //             if (minutes[i][keys[j]] !== this.Minutes[i][keys[j]]) {
      //               console.log(keys[j], minutes[i][keys[j]], this.Minutes[i][keys[j]]);
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
      //       this.Minutes = minutes.slice();
      //       this.submit.emit(this.Minutes);
      //       changed = false;
      //     }
      //   }
      // });

      // get minutes with normal
      try {
        const response: ResponseObj = await this.ajax.getMoms(this.ncrbno).toPromise();
        response.data.map(obj => {
          console.log(obj);
          if (obj.meetingDate) {
            obj.meetingDate = moment(obj.meetingDate).format('DD MMM YYYY');
          } else {
            obj.meetingDate = null;
          }
          return obj;
        });
        this.Minutes = response.data;
        this.submit.emit(this.Minutes);
      } catch (ex) {
        console.error('D3 Minutes Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'MINUTES') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    // this.messageSub.unsubscribe();
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.userSub.unsubscribe();
    this.statusSub.unsubscribe();
  }

  onAddMinute(): void {
    this.bsModalRef = this.modalService.show(D3AddMomComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        ncrbid: this.ncrbid
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      data.ncrbNo = this.ncrbno;
      this.processing = true;
      try {
        const response: ResponseObj = await this.ajax
          .saveMom(Object.assign({}, data, { userName: this.user.username }))
          .toPromise();
        response.data.meetingDate = moment(response.data.meetingDate).format('DD MMM YYYY');
        this.Minutes.push(response.data);
        this.submit.emit(this.Minutes);
        alertSuccess(
          `
        <p>Submitted form D3 (Add Minute) !</p>
        <span style="color: green; white-space: pre-line;">Successfully !</span>
        `,
          'Successful!',
          () => {
            this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
          }
        );
      } catch (ex) {
        console.error('D3 Minutes (Add Minute) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.processing = false;
        }, 50);
      }
    });
  }

  onSubmit(): void {
    alertConfirm('This process will take a long time.', 'Are you sure ?', rs => {
      // if (rs.value) {
      // }
    });
  }

  onEdit(id: number) {
    // TODO
    const idx: number = this.Minutes.findIndex(obj => obj.id === id);
    if (idx > -1) {
      const minute: Minute = this.Minutes[idx];
      this.bsModalRef = this.modalService.show(D3AddMomComponent, {
        ignoreBackdropClick: true,
        class: 'modal-lg modal-dialog-centered',
        initialState: {
          ncrbid: this.ncrbid,
          data: Object.assign({}, minute, { ncrbNo: this.ncrbno })
        }
      });
      this.bsModalRef.content.event.subscribe(async (data: any) => {
        data.ncrbNo = this.ncrbno;
        this.processing = true;
        try {
          const response: ResponseObj = await this.ajax
            .saveMom(Object.assign({}, data, { userName: this.user.username }))
            .toPromise();
          response.data.meetingDate = moment(response.data.meetingDate).format('DD MMM YYYY');
          this.Minutes[idx] = response.data;
          this.submit.emit(this.Minutes);
          alertSuccess(
            `
            <p>Submitted form D3 (Add Minute) !</p>
            <span style="color: green; white-space: pre-line;">Successfully !</span>
            `,
            'Successful!',
            () => {
              this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
            }
          );
        } catch (ex) {
          console.error('D3 Minutes (Update Minute) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.processing = false;
          }, 50);
        }
      });
    }
  }

  onRemove(id: number) {
    const idx: number = this.Minutes.findIndex(obj => obj.id === id);
    if (idx > -1) {
      alertConfirm('This process will remove Minute of Meeting.', 'Are you sure ?', async rs => {
        if (rs.value) {
          this.processing = true;
          try {
            const response: ResponseObj = await this.ajax
              .removeMom(Object.assign({}, this.Minutes[idx], { userName: this.user.username }))
              .toPromise();
            if (response.status === 200) {
              this.Minutes.splice(idx, 1);
              this.submit.emit(this.Minutes);
              alertSuccess(
                `<p>Removed form D3 (Add Minute) !</p>
                  <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                'Successful!',
                () => {
                  this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            console.error('D3 Minutes (Remove Minute) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  async downloadFile(idx: number) {
    const attachFile: FileObj = this.Minutes[idx].minuteFile;
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'Minutes file view',
        folders: [this.request.id.toString(), 'MOM'],
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

  isSelf(minute: Minute): boolean {
    if (minute.userName !== 'username') {
      const username: string = minute.userName; // .split('\\')[1];
      return this.user?.empId !== 'empId' && username === this.user.username;
    } else {
      return this.isOwner;
    }
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_MOM').value : 'Loading';
  }

  get subTitle(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_MOM_SUB').value : 'Loading';
  }
}
