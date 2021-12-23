import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { BaseComponent } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { ContainmentAction, Initial, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService, MessageService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, filterByName, SwalConfig } from '../../../utils';

@Component({
  selector: 'app-d3-qa',
  templateUrl: './d3-qa.component.html'
})
export class D3QaComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ncrbid: number = null;
  @Input() ncrbno: string = '';
  @Input() status: string = '';
  @Output() submit: EventEmitter<ContainmentAction[]> = new EventEmitter<ContainmentAction[]>();
  formQa: FormGroup;
  submitQa: boolean = false;
  dateConstant: DateConstant = new DateConstant();
  date: Date = new Date();
  filter = filterByName;
  d3QAs: ContainmentAction[] = [];
  Status: Status = new Status();
  params: Parameter[] = [];
  paramsSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  user: User = null;
  userSub: any = null;
  loading: boolean = false;
  processing: boolean = false;
  collapse: boolean = false;
  routeSub: any;
  messageSub: any;
  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private router: Router,
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private logService: LogService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-qa');

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
    });
    this.formQa = this.fb.group({
      id: [null],
      lotId: [null, Validators.required],
      machineNo: [null, Validators.required],
      confirmBy: [null, Validators.required],
      remark: [null],
      reason: [null]
    });
  }

  async ngOnInit() {
    if (this.ncrbno) {
      this.loading = true;

      // get containments qa with realtime
      // this.messageSub = this.messageService.getMessage(`D3_2?ncrbno=${this.ncrbno}&section=QA`).subscribe(result => {
      //   const d3QAs: any[] = JSON.parse(result).data;
      //   if (d3QAs.length > 0) {
      //     let changed: boolean = false;
      //     d3QAs.map(obj => {
      //       if (obj.date) {
      //         obj.date = moment(obj.date).format('DD MMM YYYY');
      //       } else {
      //         obj.date = null;
      //       }
      //       return obj;
      //     });

      //     // checking data was changed
      //     if (d3QAs.length !== this.d3QAs.length) {
      //       changed = true;
      //     } else if (d3QAs.length > 0 && d3QAs.length === this.d3QAs.length) {
      //       const keys: string[] = Object.keys(d3QAs[0]);
      //       for (let i = 0; i < d3QAs.length; i++) {
      //         for (let j = 0; j < keys.length; j++) {
      //           if (keys[j] !== 'minuteFile' && keys[j] !== 'date') {
      //             if (d3QAs[i][keys[j]] !== this.d3QAs[i][keys[j]]) {
      //               console.log(keys[j], d3QAs[i][keys[j]], this.d3QAs[i][keys[j]]);
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
      //       this.d3QAs = d3QAs.slice();
      //       this.submit.emit(this.d3QAs);
      //       changed = false;
      //     }
      //   }
      // });

      // get containments qa with normal
      try {
        const response: ResponseObj = await this.ajax.getContainmentAction(this.ncrbno, 'QA').toPromise();
        if (response.status.toString() === '200') {
          response.data.map(obj => {
            if (obj.date) {
              obj.date = moment(obj.date).format('DD MMM YYYY');
            } else {
              obj.date = null;
            }
            return obj;
          });
          this.d3QAs = response.data;
          if (this.d3QAs.length > 0) {
            if (this.d3QAs.length > 0 && !this.d3QAs[this.d3QAs.length - 1].reason) {
              this.formQa.disable();
            }
            this.submit.emit(this.d3QAs);
          }
          if (this.user && this.user?.empId.toUpperCase() !== 'empId'.toUpperCase()) {
            this.formQa.get('confirmBy').patchValue(this.user.name);
          }
          if (this.request.isMerged) {
            this.formQa.disable();
          }
        }
      } catch (ex) {
        // on crash
        console.error('D3 Qa (Initial) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D3-QA') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    // this.messageSub.unsubscribe();
    this.paramsSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  onAccept(): void {
    this.submitQa = true;
    if (this.formQa.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', async result => {
        if (result.value) {
          const data: ContainmentAction = this.formQa.getRawValue();
          data.confirmById = data.confirmBy.split(' ')[0];
          this.processing = true;
          try {
            const response: ResponseObj = await this.ajax.saveContainmentAction(this.ncrbno, data).toPromise();
            if (response.status.toString() === '200') {
              this.formQa.patchValue({
                id: null,
                lotId: null,
                machineNo: null,
                confirmBy: null,
                remark: null,
                reason: null
              });
              this.submitQa = false;
              response.data.date = moment(response.data.date).format('DD MMM YYYY');
              this.d3QAs.push(response.data);
              this.submit.emit(this.d3QAs);
              alertSuccess(
                `<p>Accepted form D3 (QA) !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>
              `,
                'Successful!',
                () => {
                  this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // on crash
            console.error('D3 Qa (Accept) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  onReject(): void {
    this.submitQa = true;
    if (this.formQa.valid) {
      Swal.fire({
        ...SwalConfig,
        title: 'Reject reason..',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        input: 'text',
        inputPlaceholder: 'Enter your reject reason',
        showCancelButton: true
      }).then(async result => {
        if (result.value) {
          const data: ContainmentAction = this.formQa.getRawValue();
          data.confirmById = data.confirmBy.split(' ')[0];
          data.reason = result.value;
          this.processing = true;
          try {
            const response: ResponseObj = await this.ajax.saveContainmentAction(this.ncrbno, data).toPromise();
            if (response.status.toString() === '200') {
              this.formQa.patchValue({
                id: null,
                lotId: null,
                machineNo: null,
                confirmBy: null,
                remark: null,
                reason: null
              });
              this.submitQa = false;
              response.data.date = moment(response.data.date).format('DD MMM YYYY');
              this.d3QAs.push(response.data);
              this.submit.emit(this.d3QAs);
              alertSuccess(
                `<p>Rejected form D3 (QA) !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>
              `,
                'Successful!',
                () => {
                  this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            // on crash
            console.error('D3 Qa (Reject) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  get isSubmit() {
    return (
      this.ncrbno &&
      this.status === this.Status.SUBMIT &&
      this.d3QAs.length > 0 &&
      !this.d3QAs[this.d3QAs.length - 1].reason
    );
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_2').value : 'Loading';
  }

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }

  get isApproved(): boolean {
    return this.d3QAs.length > 0 && !this.d3QAs[this.d3QAs.length - 1].reason;
  }
}
