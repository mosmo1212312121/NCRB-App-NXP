import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { FollowUp, IA, Initial, Parameter, User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { filterByName } from '../../../utils';

@Component({
  selector: 'app-d6',
  templateUrl: './d6.component.html'
})
export class D6Component extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ncrbid: number = null;
  @Input() ackDate: any = null;
  @Input() status: string = '';
  @Input() userFullname: string = '';
  @Input() isNCRBOwner: boolean = false;
  @Output() submit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() canDisposition: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() d6: EventEmitter<boolean> = new EventEmitter<boolean>();
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
  followupSub: any = null;
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
  constructor(
    private route: ActivatedRoute,
    private ajax: AjaxService,
    private modalService: BsModalService,
    private router: Router,
    private store: Store<IAppState>,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d6');

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
    this.followupSub = this.store.pipe(select('followups')).subscribe((followups: FollowUp[]) => {
      this.IAs = followups as any[];
      this.isCollapsedOwners = [];
      this.isCollapsedDrivers = [];
      for (let i = 0; i < this.IAs.length; i++) {
        this.isCollapsedOwners.push(true);
        this.isCollapsedDrivers.push(true);
        this.IAs[i].targetDate = this.IAs[i].targetDate;
      }
      this.IAs = this.IAs.filter(obj => obj.status.trim().toUpperCase() !== 'NEW');
      this.d6.emit(this.IAs.length > 0);
    });
  }

  ngOnInit() {
    // On Initialize
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D6') === -1;
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
    this.followupSub.unsubscribe();
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
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D6').value : 'Loading';
  }
}
