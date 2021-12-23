import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BaseComponent } from '../../../components';
import { Initial, Parameter } from '../../../interfaces';
import { LogService } from '../../../services';
import { IAppState } from '../../../store/store';

@Component({
  selector: 'app-d8',
  templateUrl: './d8.component.html'
})
export class D8Component extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() d8: EventEmitter<boolean> = new EventEmitter<boolean>();
  public emails: string[] = [];
  public owners: string[] = [];
  public approvers: string[] = [];
  public firstEmail: string = '(All e-mail address of NCRB members)';
  public firstOwner: string = '(Owner name)';
  public firstApprover: string = '(Approval name + position)'; // name + position
  params: Parameter[] = [];
  paramsSub: any = null;
  requestSub: any = null;
  request: Initial = null;
  collapse: boolean = false;
  routeSub: any;
  public loading: boolean = false;
  constructor(private route: ActivatedRoute, private store: Store<IAppState>, private logService: LogService) {
    // initial component
    super(logService);
    this.setPageName('d8');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;

      this.owners = [];
      this.request.owners.sort(this.compare().default);
      for (let i = 0; i < this.request.owners.length; i++) {
        if (i === 0) {
          this.firstOwner = this.request.owners[i].name;
        } else {
          this.owners.push(this.request.owners[i].name);
        }
      }

      this.approvers = [];
      this.request.approvers.sort(this.compare().default);
      for (let i = 0; i < this.request.approvers.length; i++) {
        if (i === 0) {
          this.firstApprover = this.request.approvers[i].name;
        } else {
          this.approvers.push(this.request.approvers[i].name);
        }
      }

      this.emails = [];
      if (this.request.members) {
        this.request.members.sort(this.compare('email').default);
        for (let i = 0; i < this.request.members.length; i++) {
          if (i === 0) {
            this.firstEmail = this.request.members[i].email;
          } else {
            this.emails.push(this.request.members[i].email);
          }
        }
      }

      this.d8.emit(this.owners.length > 0 || this.approvers.length > 0 || this.emails.length > 0);
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D8') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.requestSub.unsubscribe();
  }

  compare(attr: string = 'name') {
    return {
      default: function(a, b) {
        if (a[attr].toUpperCase() < b[attr].toUpperCase()) {
          return -1;
        }
        if (a[attr].toUpperCase() > b[attr].toUpperCase()) {
          return 1;
        }
        return 0;
      }
    };
  }
  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D8').value : 'Loading';
  }
}
