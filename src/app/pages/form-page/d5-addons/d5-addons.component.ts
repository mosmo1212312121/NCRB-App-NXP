import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import {
  ContainmentActionCa,
  CorrectiveActionPCa,
  IA,
  Initial,
  Parameter,
  ResponseObj,
  User
} from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { setfollowups } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, filterByName } from '../../../utils';
import { D5AddActionComponent } from './modals/add-action.component';

@Component({
  selector: 'app-d5-addons',
  templateUrl: './d5-addons.component.html'
})
export class D5AddonsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
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
  params: Parameter[] = [];
  paramsSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  user: User = null;
  userSub: any = null;
  isSubmit: boolean = false;
  isSw1: boolean = false;
  isSw2: boolean = false;
  isCollapsedOwners: boolean[] = [];
  isCollapsedDrivers: boolean[] = [];
  collapse: boolean = false;
  routeSub: any;
  constructor(
    private ajax: AjaxService,
    private modalService: BsModalService,
    private router: Router,
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d5-addons');

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

  async ngOnInit() {
    if (this.ncrbid) {
      try {
        this.loading = true;
        const response: ResponseObj = await this.ajax.getCorrectiveActionPCa(this.ncrbid).toPromise();
        response.data.map(obj => {
          this.isCollapsedOwners.push(true);
          this.isCollapsedDrivers.push(true);
          obj.targetDate = obj.targetDate as Date;
        });
        this.IAs = response.data;
        const followups: any[] = this.IAs;
        this.store.dispatch(setfollowups({ followups: followups }));
        this.submit.emit(this.isAllStart);
        this.canDisposition.emit(this.isPriorityComplete);
      } catch (ex) {
        console.error('D5 Corrective Action Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D5') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  onAddAction(): void {
    this.bsModalRef = this.modalService.show(D5AddActionComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        ackDate: this.ackDate
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: CorrectiveActionPCa) => {
      data.createBy = this.userFullname;
      this.processing = true;
      try {
        const response: ResponseObj = await this.ajax.saveCorrectiveActionPCa(this.ncrbid, data).toPromise();
        this.isCollapsedOwners.push(true);
        this.isCollapsedDrivers.push(true);
        this.IAs.push(Object.assign({}, response.data, { ncrbid: this.ncrbid }));
        const followups: any[] = this.IAs;
        this.store.dispatch(setfollowups({ followups: followups }));
        this.submit.emit(this.isAllStart);
        this.canDisposition.emit(this.isPriorityComplete);
        alertSuccess(
          `<p>Submitted form D5 (Permanent Corrective Action) !</p>
            <span style="color: green; white-space: pre-line;">Successfully !</span>`,
          'Successful!',
          () => {
            this.router.navigate([`/requests/detail/${this.ncrbid}`], { skipLocationChange: true });
          }
        );
      } catch (ex) {
        console.error('D5 Add Action Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.processing = false;
        }, 50);
      }
    });
  }

  onAdd(id: number): void {
    const idx: number = this.IAs.findIndex(obj => obj.actionId === id);
    if (idx > -1) {
      this.bsModalRef = this.modalService.show(D5AddActionComponent, {
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
          this.IAs.push(Object.assign({}, response.data, { ncrbid: this.ncrbid }));
          const followups: any[] = this.IAs;
          this.store.dispatch(setfollowups({ followups: followups }));
          this.submit.emit(this.isAllStart);
          this.canDisposition.emit(this.isPriorityComplete);
          setTimeout(() => {
            this.processing = false;
          }, 50);
          alertSuccess(
            `<p>Submitted form D5 (Permanent Corrective) !</p>
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
                .removeCorrectiveActionPCa(id, this.user.username)
                .toPromise();
              if (response.status === 200 && response.data) {
                this.isCollapsedOwners.splice(idx, 1);
                this.isCollapsedDrivers.splice(idx, 1);
                this.IAs.splice(idx, 1);
                const followups: any[] = this.IAs;
                this.store.dispatch(setfollowups({ followups: followups }));
                this.submit.emit(this.isAllStart);
                this.canDisposition.emit(this.isPriorityComplete);
                alertSuccess(
                  `<p>Removed follow up form D5 (Permanent Corrective) !</p>
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
            const response = await this.ajax.getStartFollowUp(id, this.user.username, 'D5').toPromise();
            if (response.status === 200 && response.data) {
              this.IAs[idx].status = 'PENDING';
              const followups: any[] = this.IAs;
              this.store.dispatch(setfollowups({ followups: followups }));
              this.submit.emit(this.isAllStart);
              this.canDisposition.emit(this.isPriorityComplete);
              alertSuccess(
                `<p>Started follow up form D5 (Permanent Corrective) !</p>
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
    } else {
      isAllStart = false;
    }
    return isAllStart;
  }
  get isUserLogin() {
    return this.userFullname !== 'empId - firstname lastname';
  }
  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D5').value : 'Loading';
  }
}
