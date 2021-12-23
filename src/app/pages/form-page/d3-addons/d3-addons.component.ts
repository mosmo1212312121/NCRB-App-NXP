import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { ContainmentActionCa, IA, Initial, Parameter, ResponseObj, User } from '../../../interfaces';
import { AjaxService, LogService, MessageService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, filterByName } from '../../../utils';
import { D3AddActionComponent } from './modals/add-action.component';

@Component({
  selector: 'app-d3-addons',
  templateUrl: './d3-addons.component.html'
})
export class D3AddonsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('D3_3') d3_3: ElementRef;
  @Input() ncrbid: number = null;
  @Input() ackDate: any = null;
  @Input() status: string = '';
  @Input() userFullname: string = '';
  @Input() isNCRBOwner: boolean = false;
  @Output() submit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() canDisposition: EventEmitter<boolean> = new EventEmitter<boolean>();
  formAd: FormGroup;
  submitAd: boolean = false;
  dateConstant: DateConstant = new DateConstant();
  date: Date = new Date();
  IAs: IA[] = [];
  filter = filterByName;
  bsModalRef: BsModalRef;
  Status: Status = new Status();
  loading: boolean = false;
  processing: boolean = false;
  request: Initial = null;
  requestSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  user: User = null;
  userSub: any = null;
  isSubmit: boolean = false;
  isSw1: boolean = false;
  isSw2: boolean = false;
  isCollapsedOwners: boolean[] = [];
  isCollapsedDrivers: boolean[] = [];

  collapse: boolean = false;
  routeSub: any;
  messageSub: any;
  constructor(
    private ajax: AjaxService,
    private modalService: BsModalService,
    private router: Router,
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private logService: LogService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-addons');

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
    });
  }

  ngOnInit(): void {
    if (this.ncrbid) {
      this.loading = true;

      // get containment action with realtime
      // this.messageSub = this.messageService.getMessage(`D3_3?ncrbid=${this.ncrbid}`).subscribe(result => {
      //   const containments: any[] = JSON.parse(result).data;
      //   if (containments.length > 0) {
      //     let changed: boolean = false;
      //     containments.map(obj => {
      //       if (obj.targetDate) {
      //         obj.targetDate = moment(obj.targetDate).format('DD MMM YYYY');
      //       } else {
      //         obj.targetDate = null;
      //       }
      //       if (obj.postponeDate) {
      //         obj.postponeDate = moment(obj.postponeDate).format('DD MMM YYYY');
      //       } else {
      //         obj.postponeDate = null;
      //       }
      //       if (obj.esTime) {
      //         obj.esTime = moment(obj.esTime).format('DD MMM YYYY');
      //       } else {
      //         obj.esTime = null;
      //       }
      //       return obj;
      //     });

      //     // checking data was changed
      //     if (containments.length !== this.IAs.length) {
      //       changed = true;
      //     } else if (containments.length > 0 && containments.length === this.IAs.length) {
      //       const keys: string[] = Object.keys(containments[0]);
      //       for (let i = 0; i < containments.length; i++) {
      //         for (let j = 0; j < keys.length; j++) {
      //           if (keys[j] !== 'actionOwners' && keys[j] !== 'actionDrivers') {
      //             if (containments[i][keys[j]] !== this.IAs[i][keys[j]]) {
      //               console.log(keys[j], containments[i][keys[j]], this.IAs[i][keys[j]]);
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

      //       this.isCollapsedOwners = [];
      //       this.isCollapsedDrivers = [];
      //       containments.map(obj => {
      //         this.isCollapsedOwners.push(true);
      //         this.isCollapsedDrivers.push(true);
      //         return obj;
      //       });
      //       this.IAs = containments.slice();
      //       this.submit.emit(this.isAllStart);
      //       this.canDisposition.emit(this.isPriorityComplete);
      //       changed = false;
      //     }
      //   }
      // });

      // get containment action with normal
      this.ajax.getContainmentActionCa(this.ncrbid).subscribe(
        response => {
          response.data.map(obj => {
            this.isCollapsedOwners.push(true);
            this.isCollapsedDrivers.push(true);
            if (obj.targetDate) {
              obj.targetDate = moment(obj.targetDate).format('DD MMM YYYY');
            } else {
              obj.targetDate = null;
            }
            if (obj.postponeDate) {
              obj.postponeDate = moment(obj.postponeDate).format('DD MMM YYYY');
            } else {
              obj.postponeDate = null;
            }
            if (obj.esTime) {
              obj.esTime = moment(obj.esTime).format('DD MMM YYYY');
            } else {
              obj.esTime = null;
            }
            return obj;
          });
          this.IAs = response.data;
          this.submit.emit(this.isAllStart);
          this.canDisposition.emit(this.isPriorityComplete);
        },
        error => {
          console.error(error);
        },
        () => {
          // finally
          this.loading = false;
        }
      );
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D3-ACTION') === -1;
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
  }

  onAddAction(): void {
    this.bsModalRef = this.modalService.show(D3AddActionComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        ackDate: this.ackDate
      }
    });
    this.bsModalRef.content.event.subscribe((data: ContainmentActionCa) => {
      data.createBy = this.userFullname;
      this.processing = true;
      this.ajax.saveContainmentActionCa(this.ncrbid, data).subscribe(response => {
        this.isCollapsedOwners.push(true);
        this.isCollapsedDrivers.push(true);
        response.data.targetDate = moment(response.data.targetDate)
          .subtract(1, 'day')
          .format('DD MMM YYYY');
        this.IAs.push(response.data);
        this.submit.emit(this.isAllStart);
        this.canDisposition.emit(this.isPriorityComplete);
        setTimeout(() => {
          this.processing = false;
        }, 50);
        alertSuccess(
          `<p>Submitted form D3 (Action Additional) !</p>
            <span style="color: green; white-space: pre-line;">Successfully !</span>`,
          'Successful!',
          () => {
            this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
          }
        );
      });
    });
  }

  onAdd(id: number): void {
    const idx: number = this.IAs.findIndex(obj => obj.actionId === id);
    if (idx > -1) {
      this.bsModalRef = this.modalService.show(D3AddActionComponent, {
        ignoreBackdropClick: true,
        class: 'modal-lg modal-dialog-centered',
        initialState: {
          data: this.IAs[idx],
          ackDate: this.ackDate
        }
      });
      this.bsModalRef.content.event.subscribe((data: ContainmentActionCa) => {
        data.createBy = this.userFullname;
        this.processing = true;
        this.ajax.saveContainmentActionCa(this.ncrbid, data).subscribe(response => {
          this.isCollapsedOwners.push(true);
          this.isCollapsedDrivers.push(true);
          response.data.targetDate = moment(response.data.targetDate)
            .subtract(1, 'day')
            .toDate();
          response.data.targetDate = moment(response.data.targetDate).format('DD MMM YYYY');
          this.IAs.push(response.data);
          this.submit.emit(this.isAllStart);
          this.canDisposition.emit(this.isPriorityComplete);
          setTimeout(() => {
            this.processing = false;
          }, 50);
          alertSuccess(
            `<p>Submitted form D3 (Action Additional) !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
            'Successful!',
            () => {
              this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
            }
          );
        });
      });
    }
  }

  onRemove(id: number): void {
    const idx: number = this.IAs.findIndex(obj => obj.actionId === id);
    if (idx > -1) {
      alertConfirm(
        'Make sure, your will remove containment action number: ' + id + '.',
        'Are you sure ?',
        async result => {
          if (result.value) {
            this.processing = true;
            try {
              const response: ResponseObj = await this.ajax
                .removeContainmentActionCa(id, this.user.username)
                .toPromise();
              if (response.status === 200 && response.data) {
                this.isCollapsedOwners.splice(idx, 1);
                this.isCollapsedDrivers.splice(idx, 1);
                this.IAs.splice(idx, 1);
                this.submit.emit(this.isAllStart);
                this.canDisposition.emit(this.isPriorityComplete);
                alertSuccess(
                  `<p>Removed follow up form D3 (Action Additional) !</p>
                <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                  'Successful!',
                  () => {
                    this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                  }
                );
              }
            } catch (ex) {
              // on crash
              console.error('D3 Addons (Remove) Errors: ', ex);
            } finally {
              setTimeout(() => {
                this.processing = false;
              }, 50);
            }
          }
        }
      );
    }
  }

  onSubmit(id: number): void {
    const idx: number = this.IAs.findIndex(obj => obj.actionId === id);
    if (idx > -1) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', async result => {
        if (result.value) {
          try {
            this.processing = true;
            const response = await this.ajax.getStartFollowUp(id, this.user.username).toPromise();
            if (response.status === 200 && response.data) {
              this.IAs[idx].status = 'PENDING';
              this.submit.emit(this.isAllStart);
              this.canDisposition.emit(this.isPriorityComplete);
              alertSuccess(
                `<p>Started follow up form D3 (Action Additional) !</p>
                <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                'Successful!',
                () => {
                  this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
                }
              );
            }
          } catch (ex) {
            console.error(ex);
          } finally {
            setTimeout(() => {
              this.processing = false;
            }, 50);
          }
        }
      });
    }
  }

  isNew(status: string) {
    return status === 'NEW';
  }
  isPending(status: string) {
    return status === 'PENDING';
  }
  isPostpone(status: string) {
    return status === 'POSTPONE';
  }
  isAcknowledge(status: string) {
    return status === 'ACKNOWLEDGE';
  }
  isComplete(status: string) {
    return status === 'COMPLETE';
  }
  isOwner(createBy: string) {
    return this.userFullname === createBy;
  }
  get isPriorityComplete() {
    // CA
    let isPriorityComplete: boolean = true;
    if (this.IAs.length > 0) {
      for (let i = 0; i < this.IAs.length; i++) {
        if (this.IAs[i].status !== 'COMPLETE' && this.IAs[i].priority) {
          isPriorityComplete = false;
        }
      }
    } else {
      isPriorityComplete = true;
    }
    return isPriorityComplete;
  }
  get isAllStart() {
    // CA
    let isAllStart: boolean = true;
    if (this.IAs.length > 0) {
      for (let i = 0; i < this.IAs.length; i++) {
        if (this.IAs[i].status === 'NEW') {
          isAllStart = false;
        }
      }
    }
    return isAllStart;
  }
  get isUserLogin() {
    return this.userFullname !== 'empId - firstname lastname';
  }
  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_3').value : 'Loading';
  }
}
