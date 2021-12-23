import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { BaseComponent, NxpSelection } from '../../../components';
import { DateConstant, Status } from '../../../constants';
import { Initial, Lot, Owner, Parameter, ResponseObj, Score, User } from '../../../interfaces';
import {
  AjaxService,
  BoardGroupService,
  DropdownService,
  LogService,
  MessageService,
  MockService
} from '../../../services';
import { sethistories, setprops, setrequest, setscore, setscoreold } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { filterByName } from '../../../utils';
import { MemberComponent } from '../../request/modals/member.component';
import { OwnersComponent } from '../../request/modals/owners.component';

@Component({
  selector: 'app-d1',
  templateUrl: 'd1.component.html'
})
export class D1Component extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() ncrbId: number = null;
  form: FormGroup = null;
  problemTypes: NxpSelection[] = [];
  categories: NxpSelection[] = [];
  facodes: NxpSelection[] = [];
  rejectNames: NxpSelection[] = [];
  materialTypes: NxpSelection[] = [];
  mfgs: NxpSelection[] = [];
  issueByGroups: NxpSelection[] = [];
  subMfgs: NxpSelection[] = [];
  shifts: NxpSelection[] = [];
  problemProcesses: NxpSelection[] = [];
  specials: NxpSelection[] = [];
  stopAndFixes: NxpSelection[] = [];
  typeName: string = '';
  submit: boolean = false;
  id: number = null;
  score: Score = null;
  scoreSub: any = null;
  user: User = null;
  userSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  status: Status = new Status();
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  bsModalRef: BsModalRef;
  loading: boolean = true;
  hasChange: boolean = false;

  collapse: boolean = false;
  routeSub: any;
  messageSub: any;
  private _updated = false;
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private store: Store<IAppState>,
    private router: Router,
    private mock: MockService,
    private boardGroup: BoardGroupService,
    private logService: LogService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    // initial component
    super(logService);
    this.setPageName('d1');

    this.form = this.fb.group({
      /* Section 1 */
      id: [null],
      ncnumber: [{ value: null, disabled: true }, Validators.required],
      date: [{ value: new Date(), disabled: true }, Validators.required],
      problemType: [null, Validators.required], // null
      issueByName: ['', Validators.required],
      mfg: [null, Validators.required], // null
      issueByGroup: [null, Validators.required],
      mfg2: [null, Validators.required], // null
      subMfg: [null, Validators.required],
      shift: [null, Validators.required],
      problemProcess: [null, Validators.required],
      special: [1], // Default `No`
      stopAndFix: [null, Validators.required],
      workflow: [null]
      /* Section 1 */
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
      if (!this.id) {
        if (this.user.empId.toUpperCase() !== 'empId'.toUpperCase()) {
          this.form.get('issueByName').patchValue(this.user.name);
        }
      }
      if (this.user.empId !== 'empId') {
        this.onFetching(this.id);
      }
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      if (!request.oldIssueByName) {
        this.request.oldIssueByName = request.issueByName;
      }
      if (this.request.submit) {
        this.submit = this.request.submit;
      }
    });
    this.scoreSub = this.store.pipe(select('score')).subscribe((score: Score) => {
      this.score = score;
    });
    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
  }

  async ngOnInit() {
    try {
      // await this.dropdown.getDropdowns().toPromise();
      const results = await this.ajax.getPromiseAll([
        this.dropdown.getDropdownByGroup('PROBLEM').toPromise(),
        this.dropdown.getDropdownByGroup('MFG').toPromise(),
        this.dropdown.getDropdownByGroup('ISSUEBY').toPromise(),
        this.dropdown.getDropdownByGroup('SHIFT').toPromise(),
        this.dropdown.getDropdownByGroup('SPECIAL').toPromise(),
        this.dropdown.getDropdownByGroup('STOPNFIX').toPromise(),
        this.dropdown.getDropdownByGroup('CATEGORY').toPromise(),
        this.dropdown.getDropdownByGroup('FACODE').toPromise(),
        this.dropdown.getDropdownMaterial().toPromise()
      ]);

      /* get lists */
      this.problemTypes = results[0].data;
      this.mfgs = results[1].data;
      this.issueByGroups = results[2].data;
      this.shifts = results[3].data;
      this.specials = results[4].data;
      this.stopAndFixes = results[5].data;
      this.categories = results[6].data;
      const faCodeRes = results[7];
      const materialRes = results[8];
      if (faCodeRes.status === 200) {
        const data = faCodeRes.data.map(obj => {
          return { id: obj.id, label: obj.label, value: obj.value ? parseInt(obj.value, 10) : '' };
        });
        this.facodes = data;
      }
      if (materialRes.status === 200) {
        const data = materialRes.data.map(obj => {
          return { id: obj.id, label: obj.codeName, value: obj.id };
        });
        this.materialTypes = data;
        this.materialTypes.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }
      /* get lists */
      const id = this.ncrbId ? this.ncrbId.toString() : this.route.snapshot.paramMap.get('id');
      this.id = id ? parseInt(id, 10) : null;
      if (this.id) {
        await this.onFetching(this.id);
      } else {
        // When don't have id will generate `ncnumber` from backend
        const date = new Date();
        const fullYearStr: string = date
          .getFullYear()
          .toString()
          .substring(0, 2);
        const monthStr: string = ('0' + `${date.getMonth() + 1}`).slice(-2); //`${date.getMonth() + 1}`.padStart(2, '0');
        const response = {
          status: 200,
          data: `${fullYearStr}${monthStr}XXXX`,
          statusText: ''
        };
        if (response.status === 200) {
          this.form.get('ncnumber').patchValue(response.data);
          if (this.user.empId.toUpperCase() !== 'empId'.toUpperCase()) {
            this.form.get('issueByName').patchValue(this.user.name);
          }
          // this.request.category = 2;
          this.hasChange = false;
          this.onChange();
        }
      }
    } catch (ex) {
      // On Crashed
      console.error('D1 (Initial) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D1') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    // if (this.messageSub) {
    //   this.messageSub.unsubscribe();
    // }
    this.routeSub.unsubscribe();
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.scoreSub.unsubscribe();
    this.paramsSub.unsubscribe();
    this.store.dispatch(setprops({ loadingSec: 0 }));
  }

  async onFetching(id: number) {
    if (id) {
      let res: ResponseObj = await this.ajax.getRequest(this.id).toPromise();
      let idx: number = -1;
      if (res.status === 200) {
        // Prepare Data
        this.score = res.data as Score;
        this.request = res.data.info as Initial;
        // Request Date
        if (!this.isDraft) {
          this.request.date = new Date(this.request.date);
        } else {
          this.request.date = new Date();
        }

        // Declaration Requests
        const score = this.ajax.getCalculateScore(this.request).toPromise();
        const history = this.ajax.getHistoryByNcrbno(this.request.ncnumber.toString()).toPromise();
        const member = this.ajax.getMembers(this.request.ncnumber.toString()).toPromise();

        // Loading Requests
        let results = await this.ajax.getPromiseAll([score, history, member]);
        const scoreRes = results[0];
        const historiesRes = results[1];
        const membersRes = results[2];

        // Using Response
        if (scoreRes.status === 200) {
          this.store.dispatch(setscoreold(scoreRes.data));
        }
        if (historiesRes.status === 200) {
          const histories = historiesRes.data;
          histories.map(obj => {
            obj.commentDate = new Date(obj.commentDate);
          });
          this.store.dispatch(sethistories({ histories: histories }));
        }
        if (membersRes.status === 200) {
          this.request.members = membersRes.data;
          // this.store.dispatch(setrequest(Object.assign({}, this.request, { members: membersRes.data })));
        }

        results = await this.ajax.getPromiseAll([
          this.boardGroup.getBoardLotInstructions(id).toPromise(),
          this.boardGroup.getBoardNCRB(id).toPromise()
        ]);

        const boardGroupReqs = results[0].data;
        this.request.boardGroupReqs = boardGroupReqs;

        const boardGroupReqNCRBs = results[1].data;
        this.request.boardGroupReqNCRBs = boardGroupReqNCRBs;

        this.request.problemType = this.o2null(this.request.problemType);
        // this.request.mfg = this.o2null(this.request.mfg);
        this.request.issueByGroup = this.o2null(this.request.issueByGroup);
        // this.request.mfg2 = this.o2null(this.request.mfg2);
        // this.request.subMfg = this.o2null(this.request.subMfg);
        this.request.shift = this.o2null(this.request.shift);
        // this.request.problemProcess = this.o2null(this.request.problemProcess);
        this.request.special = this.o2null(this.request.special);
        this.request.stopAndFix = this.o2null(this.request.stopAndFix);
        this.request.rejectName = this.o2null(this.request.rejectName);
        // this.request.spec = this.o2null(this.request.spec);
        this.request.category = this.o2null(this.request.category);
        this.request.materialType = this.o2null(this.request.materialType);
        if (this.request.mfg && this.request.subMfg) {
          const boardGroups = (
            await this.boardGroup
              .getBoardGroupBySubMfg(this.request.mfg.toString(), this.request.subMfg.toString())
              .toPromise()
          ).data;
          this.request.boardGroups = boardGroups;
        }
        this.form = this.fb.group({
          id: [this.request.id],
          ncnumber: [{ value: this.request.ncnumber, disabled: true }, Validators.required],
          date: [{ value: this.request.date, disabled: true }, Validators.required],
          problemType: [this.request.problemType, Validators.required], // null
          issueByName: [{ value: this.request.issueByName, disabled: true }, Validators.required],
          mfg: [this.request.mfg, Validators.required], // null
          issueByGroup: [this.request.issueByGroup, Validators.required],
          mfg2: [this.request.mfg2, Validators.required], // null
          subMfg: [this.request.subMfg, Validators.required],
          shift: [this.request.shift, Validators.required],
          problemProcess: [this.request.problemProcess, Validators.required],
          special: [this.request.special], // Default `No`
          stopAndFix: [this.request.stopAndFix, Validators.required],
          lotMaster: [this.request.lotMaster],
          workflow: [this.request.workflow]
        });

        if (this.request.ncnumber && !this.messageSub) {
          // get lots auto update with realtime
          // this.messageSub = this.messageService.getMessage(`LOTs?ncrbno=${this.request.ncnumber}`).subscribe(result => {
          //   const lots: Lot[] = JSON.parse(result).data;
          //   console.log(lots);
          // });
        }

        if (!this.form.disabled && !this._updated) {
          // Problem Type
          this.form.patchValue({ problemType: this.request.problemType.toString() });
          this.onTypeChange(true);

          // Mfg
          this.form.patchValue({ mfg: this.request.mfg.toString(), mfg2: this.request.mfg2.toString() });

          // SubMfg
          idx = this.mfgs.findIndex(obj => obj.value === this.request.mfg.toString());
          if (idx > -1) {
            res = await this.dropdown.getDropdown(this.mfgs[idx].id.toString(), 'AREA').toPromise();
            this.subMfgs = res.data;
            this.form.get('subMfg').patchValue(this.request.subMfg.toString());
            idx = this.subMfgs.findIndex(obj => obj.value === this.request.subMfg.toString());
            await this.getRejectNames(this.request.subMfg.toString());
          }

          // Problem Process
          if (idx > -1 && this.request.subMfg) {
            res = await this.dropdown.getDropdown(this.subMfgs[idx].id.toString(), 'PROBLEMPROCESS').toPromise();
            this.problemProcesses = res.data;

            // ProblemProcess
            // if (this.isPreviousProcess) {
            // this.form.get('problemProcess').patchValue(this.request.problemProcess.toString());
            // this.form.get('problemProcess').patchValue('0');
            // } else {
            this.form.get('problemProcess').patchValue(this.request.problemProcess.toString());
            // }
          }

          this._updated = true;
        }

        if (this.isMember && this.isDraft) {
          this.disable('form', 'issueByName');
        }

        if (!this.isDraft) {
          this.disable('form', 'problemType');
          this.disable('form', 'mfg');
          this.disable('form', 'mfg2');
          this.disable('form', 'issueByName');
        }
        let response: ResponseObj = null;
        if (
          !this.isEditingBy && // no editor now
          (!this.request.editingBy || this.request.editingBy === 'null') &&
          ((this.isOwner && (this.isRequest || this.isAcknowledge)) ||
            ((this.isRequestor || this.isMember) && this.isDraft))
        ) {
          response = await this.ajax.updateEditing(this.id, this.user.name).toPromise();
          if (response.status === 200 && response.data) {
            this.request.editingBy = this.user.name;
          }
        } else if (
          (this.isOwner && (this.isRequest || this.isAcknowledge)) ||
          ((this.isRequestor || this.isMember) && this.isDraft)
        ) {
          // editing check to kick
          response = await this.ajax.checkEditingExpired(this.id, this.user.name).toPromise();
          if (response.status === 200 && response.data) {
            this.request.editingBy = this.user.name;
          }
        }
        if (
          (!this.isOwner && this.isRequest) ||
          this.isAcknowledge ||
          this.isSubmit ||
          (!this.isRequestor && !this.isMember && this.isDraft) ||
          (this.id && !this.isEditingBy)
        ) {
          this.form.disable();
        }
        if (!this.isEditingBy && !this.isRequestor && this.isMember && this.isDraft) {
          this.form.get('issueByName').disable();
        }
        if (this.isRequest || this.isAcknowledge || this.isSubmit || this.isSw2Submit) {
          this.form.get('issueByName').disable();
        }
        if (this.isMerged) {
          this.form.disable();
        }
        this.form.updateValueAndValidity();

        // Dispatch state to store
        this.request = Object.assign(this.request, this.form.getRawValue());
        this.hasChange = false;
        this.onChange();
      }
    }
  }

  /* Forms Event */
  onTypeChange(event) {
    if (event && this.isPreviousProcess && this.form.get('problemProcess')) {
      this.form.get('problemProcess').patchValue('');
    }
    const type: string = this.form.getRawValue().problemType;
    switch (parseInt(type, 10)) {
      case 1: // In Process
        this.typeName = 'In-process';
        break;
      case 2: // Previous Process
        this.typeName = 'Feedback from previous process';
        break;
      case 3: // Material
        this.typeName = 'Material';
        break;
      case 4: // On Hold
        this.typeName = 'On Hold';
        break;
      default:
        this.typeName = 'In-process';
        break;
    }
    this.request.typeName = this.typeName;
    if (typeof event !== 'boolean') {
      this.hasChange = true;
      this.submit = false;
      this.form.get('mfg').patchValue('');
      this.onChange(event);
    }
  }
  async onMfgChange(event: string) {
    if (event && typeof event !== 'object') {
      const idx: number = this.mfgs.findIndex(obj => obj.value === event);
      if (idx > -1) {
        try {
          this.hasChange = true;
          this.loading = true;
          const response = await this.dropdown.getDropdown(this.mfgs[idx].id.toString(), 'AREA').toPromise();
          this.subMfgs = response.data;
          if (this.isMaterial) {
            this.form.get('mfg2').patchValue(event);
          }
          this.submit = false;
          this.enable('form', 'subMfg');
          if (this.isPreviousProcess && this.form.get('problemProcess')) {
            this.form.get('problemProcess').patchValue('');
          }
          this.onChange(event);
        } catch (ex) {
          // On Crashed
          console.error('D1 (Mfg Change) Errors: ', ex);
        } finally {
          this.loading = false;
        }
      }
    }
  }

  onMfg2Change(event: string) {
    if (event && typeof event !== 'object') {
      try {
        let ownerMaterial: string = '';
        const idx: number = this.params.findIndex(obj => obj.label === 'OWNER_MATERIAL');
        if (idx > -1) {
          ownerMaterial = this.params[idx].value;
        }
        this.request.ownerMaterial = ownerMaterial;
        this.hasChange = true;
        this.onChange(event);
      } catch (ex) {
        // On Crashed
        console.error('D1 (Mfg2 Change) Errors: ', ex);
      }
    }
  }

  async onSubMfgChange(event: string) {
    if (event && typeof event !== 'object') {
      const idx: number = this.subMfgs.findIndex(obj => obj.value.toString() === event);
      if (idx > -1) {
        try {
          this.hasChange = true;
          this.loading = true;
          const response = await this.dropdown
            .getDropdown(this.subMfgs[idx].id.toString(), 'PROBLEMPROCESS')
            .toPromise();

          // fetch problem process
          this.problemProcesses = response.data;
          this.submit = false;
          // if (this.isPreviousProcess) {
          //   this.problemProcesses = this.problemProcesses.filter(obj => obj.label.toString() === 'NONE');
          //   this.form.get('problemProcess').patchValue(this.problemProcesses[0].value);
          //   setTimeout(() => {
          //     const DOC: any = document;
          //     DOC.getElementById('problemProcess').value = this.problemProcesses[0].value;
          //     this.onProblemProcessChange(this.problemProcesses[0].value);
          //   }, 500);
          // } else {
          //   this.problemProcesses = this.problemProcesses.filter(obj => obj.label.toString() !== 'NONE');
          // }

          //  fetch reject names
          await this.getRejectNames(event);

          this.onChange(event);
        } catch (ex) {
          // On Crashed
          console.error('D1 (SubMfg Change) Errors: ', ex);
        } finally {
          this.loading = false;
        }
      }
    }
  }

  async getRejectNames(subMfg: string) {
    const { mfg } = this.form.getRawValue();
    const data = (await this.dropdown.getDropdownReject().toPromise()).data
      .filter(o => o.mfg.toString() === mfg.toString() && o.subMfg.toString() === subMfg.toString())
      .map(o => {
        return { id: o.id, label: o.codeName, value: o.id, faCode: o.faCode };
      });
    this.rejectNames = data;
  }

  async onProblemProcessChange(event) {
    if ((event || event === '0') && typeof event !== 'object') {
      try {
        this.hasChange = true;
        this.loading = true;
        const problemProcessValue: string = this.form.getRawValue().problemProcess;
        const idx: number = this.problemProcesses.findIndex(
          obj => obj.value.toString() === problemProcessValue.toString()
        );
        if (idx > -1) {
          const problemProcessId: string = this.problemProcesses[idx].id.toString();
          const response: ResponseObj = await this.ajax.getOwner(problemProcessId).toPromise();

          // Owners
          const owners: Owner[] = response.data.d3Owner;
          let uniqueOwners: Owner[] = [];
          if (
            this.request.owners.length > 0 &&
            this.request.owners.findIndex(obj => obj.by === 'MANUAL' && obj.id === 0) > -1
          ) {
            this.request.owners = this.request.owners.filter(obj => obj.by === 'MANUAL' && obj.id === 0);
            for (let i = 0; i < owners.length; i++) {
              this.request.owners.push(owners[i]);
            }
            uniqueOwners = Array.from(new Set(this.request.owners.map(a => a.name))).map(name => {
              return this.request.owners.find(a => a.name === name);
            });
          } else {
            uniqueOwners = owners;
          }
          this.request.owners = uniqueOwners;

          // Owners D4D8
          const ownersD4d8: Owner[] = response.data.d4d8Owner;
          let uniqueOwnersD4d8: Owner[] = [];
          if (
            this.request.ownersD4d8.length > 0 &&
            this.request.ownersD4d8.findIndex(obj => obj.by === 'MANUAL') > -1
          ) {
            this.request.ownersD4d8 = this.request.ownersD4d8.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < ownersD4d8.length; i++) {
              this.request.ownersD4d8.push(ownersD4d8[i]);
            }
            uniqueOwnersD4d8 = Array.from(new Set(this.request.ownersD4d8.map(a => a.name))).map(name => {
              return this.request.ownersD4d8.find(a => a.name === name);
            });
          } else {
            uniqueOwnersD4d8 = ownersD4d8;
          }
          this.request.ownersD4d8 = uniqueOwnersD4d8;

          console.log(response.data);

          // Finances
          const finances: Owner[] = response.data.finances;
          let uniqueFinances: Owner[] = [];
          if (this.request.finances.length > 0 && this.request.finances.findIndex(obj => obj.by === 'MANUAL') > -1) {
            this.request.finances = this.request.finances.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < finances.length; i++) {
              this.request.finances.push(finances[i]);
            }
            uniqueFinances = Array.from(new Set(this.request.finances.map(a => a.name))).map(name => {
              return this.request.finances.find(a => a.name === name);
            });
          } else {
            uniqueFinances = finances;
          }
          this.request.finances = uniqueFinances;

          // Directors
          const directors: Owner[] = response.data.directors;
          let uniqueDirectors: Owner[] = [];
          if (this.request.directors.length > 0 && this.request.directors.findIndex(obj => obj.by === 'MANUAL') > -1) {
            this.request.directors = this.request.directors.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < directors.length; i++) {
              this.request.directors.push(directors[i]);
            }
            uniqueDirectors = Array.from(new Set(this.request.directors.map(a => a.name))).map(name => {
              return this.request.directors.find(a => a.name === name);
            });
          } else {
            uniqueDirectors = directors;
          }
          this.request.directors = uniqueDirectors;

          // FuQas
          const fuqa: Owner[] = response.data.fuqa;
          let uniqueFuqa: Owner[] = [];
          if (this.request.fuqa.length > 0 && this.request.fuqa.findIndex(obj => obj.by === 'MANUAL') > -1) {
            this.request.fuqa = this.request.fuqa.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < fuqa.length; i++) {
              this.request.fuqa.push(fuqa[i]);
            }
            uniqueFuqa = Array.from(new Set(this.request.fuqa.map(a => a.name))).map(name => {
              return this.request.fuqa.find(a => a.name === name);
            });
          } else {
            uniqueFuqa = fuqa;
          }
          this.request.fuqa = uniqueFuqa;

          // PemQas
          const pemqa: Owner[] = response.data.pemqa;
          let uniquePemqa: Owner[] = [];
          if (this.request.pemqa.length > 0 && this.request.pemqa.findIndex(obj => obj.by === 'MANUAL') > -1) {
            this.request.pemqa = this.request.pemqa.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < pemqa.length; i++) {
              this.request.pemqa.push(pemqa[i]);
            }
            uniquePemqa = Array.from(new Set(this.request.pemqa.map(a => a.name))).map(name => {
              return this.request.pemqa.find(a => a.name === name);
            });
          } else {
            uniquePemqa = pemqa;
          }
          this.request.pemqa = uniquePemqa;

          // MTE Enginners
          const mteEngineers: Owner[] = response.data.mteEngineers;
          let uniqueMteEnginners: Owner[] = [];
          if (
            this.request.mteEngineers.length > 0 &&
            this.request.mteEngineers.findIndex(obj => obj.by === 'MANUAL') > -1
          ) {
            this.request.mteEngineers = this.request.mteEngineers.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < mteEngineers.length; i++) {
              this.request.mteEngineers.push(mteEngineers[i]);
            }
            uniqueMteEnginners = Array.from(new Set(this.request.mteEngineers.map(a => a.name))).map(name => {
              return this.request.mteEngineers.find(a => a.name === name);
            });
          } else {
            uniqueMteEnginners = mteEngineers;
          }
          this.request.mteEngineers = uniqueMteEnginners;

          // MTE Managers
          const mteManagers: Owner[] = response.data.mteManagers;
          let uniqueMteManagers: Owner[] = [];
          if (
            this.request.mteManagers.length > 0 &&
            this.request.mteManagers.findIndex(obj => obj.by === 'MANUAL') > -1
          ) {
            this.request.mteManagers = this.request.mteManagers.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < mteManagers.length; i++) {
              this.request.mteManagers.push(mteManagers[i]);
            }
            uniqueMteManagers = Array.from(new Set(this.request.mteManagers.map(a => a.name))).map(name => {
              return this.request.mteManagers.find(a => a.name === name);
            });
          } else {
            uniqueMteManagers = mteManagers;
          }
          this.request.mteManagers = uniqueMteManagers;

          // MTE Managers
          const materialOwners: Owner[] = response.data.materialOwners;
          let uniqueMaterialOwners: Owner[] = [];
          if (
            this.request.materialOwners.length > 0 &&
            this.request.materialOwners.findIndex(obj => obj.by === 'MANUAL') > -1
          ) {
            this.request.materialOwners = this.request.materialOwners.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < materialOwners.length; i++) {
              this.request.materialOwners.push(materialOwners[i]);
            }
            uniqueMaterialOwners = Array.from(new Set(this.request.materialOwners.map(a => a.name))).map(name => {
              return this.request.materialOwners.find(a => a.name === name);
            });
          } else {
            uniqueMaterialOwners = materialOwners;
          }
          this.request.materialOwners = uniqueMaterialOwners;

          // TeamMembers
          const teamMembers: Owner[] = response.data.teamMember;
          let uniqueTeamMembers: Owner[] = [];
          if (
            this.request.teamMembers.length > 0 &&
            this.request.teamMembers.findIndex(obj => obj.by === 'MANUAL') > -1
          ) {
            this.request.teamMembers = this.request.teamMembers.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < teamMembers.length; i++) {
              this.request.teamMembers.push(teamMembers[i]);
            }
            uniqueTeamMembers = Array.from(new Set(this.request.teamMembers.map(a => a.name))).map(name => {
              return this.request.teamMembers.find(a => a.name === name);
            });
          } else {
            uniqueTeamMembers = teamMembers;
          }
          this.request.teamMembers = uniqueTeamMembers;

          // FabMembers
          const fabMember: Owner[] = response.data.fabMember;
          let uniqueFabMembers: Owner[] = [];
          if (
            this.request.fabMembers.length > 0 &&
            this.request.fabMembers.findIndex(obj => obj.by === 'MANUAL') > -1
          ) {
            this.request.fabMembers = this.request.fabMembers.filter(obj => obj.by === 'MANUAL');
            for (let i = 0; i < fabMember.length; i++) {
              this.request.fabMembers.push(fabMember[i]);
            }
            uniqueFabMembers = Array.from(new Set(this.request.fabMembers.map(a => a.name))).map(name => {
              return this.request.fabMembers.find(a => a.name === name);
            });
          } else {
            uniqueFabMembers = fabMember;
          }
          this.request.fabMembers = uniqueFabMembers;

          this.onChange(event);
        }
      } catch (ex) {
        const errorMsg = 'D1 (Get Owners By Problem Process) Errors: ' + ex;
        console.error(errorMsg);
        this.logService.pushLog(errorMsg, 'D1', 'ERROR').toPromise();
      } finally {
        this.loading = false;
      }
    }
  }

  async onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    // On Everything Change
    if (this.request) {
      this.request = Object.assign(this.request, this.form.getRawValue());
      const obj: any = this.form.getRawValue();
      Object.keys(obj).forEach((objectKey, index) => {
        if (obj[objectKey] && typeof obj[objectKey] === 'string' && obj[objectKey].trim() === '') {
          this.form.patchValue({ objectKey: '' });
        }
        if (objectKey === 'subMfg' && obj[objectKey]) {
          // console.log('subMfg: ', this.subMfgs, obj[objectKey], typeof obj[objectKey]);
          this.form.patchValue({
            subMfg: parseInt(obj[objectKey], 10)
          });
        }
        if (objectKey === 'problemProcess' && obj[objectKey]) {
          // console.log('problemProcess: ', this.problemProcesses, obj[objectKey], typeof obj[objectKey]);
          this.form.patchValue({
            problemProcess: parseInt(obj[objectKey], 10)
          });
        }
      });

      this.request.d1Valid = this.form.valid;
      this.request.date = moment(this.request.date, this.dateConstant.format.toUpperCase()).toDate();
      this.request.faCode = this.request.faCode || 0;

      // ProblemType
      this.request.isInProcess = this.isInProcess;
      this.request.isMaterial = this.isMaterial;
      this.request.isOnHold = this.isOnHold;
      this.request.isPreviousProcess = this.isPreviousProcess;

      // Mfg
      this.request.isFinal = this.isFinal;
      this.request.isWafer = this.isWafer;
      this.request.notFinalAndWafer = this.notFinalAndWafer;
      this.request.isSelectProblemTypeAndMfg = this.isSelectProblemTypeAndMfg;

      // Request status
      this.request.isRequest = this.isRequest;
      this.request.isAcknowledge = this.isAcknowledge;
      this.request.isSubmit = this.isSubmit;
      this.request.isSw1 = this.isSw1;
      this.request.isSw2 = this.isSw2;
      this.request.isSw2Submit = this.isSw2Submit;
      this.request.isDraft = this.isDraft;
      this.request.isHuman = this.isHuman;
      this.request.isInstruction = this.isInstruction;
      this.request.isMerged = this.isMerged;
      this.request.isCompleted = this.isCompleted;

      // User status
      this.request.isEditingBy = this.isEditingBy;
      this.request.isEngineer = this.isEngineer;
      this.request.isFuQa = this.isFuQa;
      this.request.isMember = this.isMember;
      this.request.isOwner = this.isOwner;
      this.request.isPemQa = this.isPemQa;
      this.request.isPeTe = this.isPeTe;
      this.request.isMte = this.isMte;
      this.request.isRequestor = this.isRequestor;
      this.request.isManager = this.isManager;
      this.request.isOwnerD4D8 = this.isOwnerD4D8;

      // System status
      this.request.isProduct = this.isProduct;
      this.request.hasChange = this.hasChange;

      // Dropdowns
      this.request.rejectNames = this.rejectNames;
      this.request.categories = this.categories;
      this.request.facodes = this.facodes;
      this.request.materialTypes = this.materialTypes;

      // New Instance
      this.request = Object.assign({}, this.request);

      // Dispatch data to all components
      this.store.dispatch(setrequest(this.request));
      this.store.dispatch(setscore(this.score));
    }
  }

  onMemberClick(): void {
    this.bsModalRef = this.modalService.show(MemberComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        ncrbno: this.request.ncnumber,
        isOwner: this.isOwner
      }
    });
    this.bsModalRef.content.event.subscribe((data: any) => {
      // TODO
    });
  }

  onOwnerClick(): void {
    this.bsModalRef = this.modalService.show(OwnersComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        owners: this.request.owners,
        ncrbid: this.request.id,
        ncrbno: this.request.ncnumber,
        username: this.user.username
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: Owner[]) => {
      this.request.owners = data;
      if (this.isAcknowledge) {
        this.onSubmit();
      } else {
        this.store.dispatch(setrequest(this.request));
      }
    });
  }

  async onSubmit() {
    try {
      const auth: string = localStorage.getItem('basic_auth'); // `${btoa('WBI\\' + result.value.username)}:${btoa(result.value.password)}`;
      const response: ResponseObj = await this.ajax.updateRequest({ ...this.request, ...{ auth } }).toPromise();
      if (response.status === 200) {
        // ON SUCCESS
        this.store.dispatch(setrequest(this.request));
      }
    } catch (ex) {}
  }
  /* Forms Event */

  /* Controls Management */
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
  private o2null(num: number): any {
    return num === 0 ? '' : num;
  }
  /* Controls Management */

  get isHuman(): boolean {
    const dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
    let categories = [];
    if (dropdowns) {
      categories = dropdowns.filter(o => o.groupName === 'CATEGORY');
    }
    return (
      categories.findIndex(o => o.id === this.request.category && o.label.toUpperCase() === 'Human'.toUpperCase()) > -1
    );
  }

  get isMaterial(): boolean {
    return this.form.getRawValue().problemType !== '' && parseInt(this.form.getRawValue().problemType, 10) === 3;
  }

  get isInProcess(): boolean {
    return this.form.getRawValue().problemType !== '' && parseInt(this.form.getRawValue().problemType, 10) === 1;
  }

  get isPreviousProcess(): boolean {
    return this.form.getRawValue().problemType !== '' && parseInt(this.form.getRawValue().problemType, 10) === 2;
  }

  get isOnHold(): boolean {
    return this.form.getRawValue().problemType !== '' && parseInt(this.form.getRawValue().problemType, 10) === 4;
  }

  get notFinalAndWafer(): boolean {
    return parseInt(this.form.getRawValue().mfg2, 10) !== 2 && parseInt(this.form.getRawValue().mfg2, 10) !== 3;
  }

  get isFinal(): boolean {
    return this.form.getRawValue().mfg2 !== '' && parseInt(this.form.getRawValue().mfg2, 10) === 6;
  }

  get isWafer(): boolean {
    return this.form.getRawValue().mfg2 !== '' && parseInt(this.form.getRawValue().mfg2, 10) === 7;
  }

  get isSelectProblemTypeAndMfg(): boolean {
    return (
      this.form.getRawValue().problemType !== '' &&
      this.form.getRawValue().mfg2 !== '' &&
      this.form.getRawValue().subMfg !== '' &&
      this.form.getRawValue().problemProcess !== ''
    );
  }

  get isProduct(): boolean {
    return environment.production;
  }

  get isAcknowledge(): boolean {
    return (
      this.id &&
      this.request &&
      this.request.status === this.status.ACKNOWLEDGE &&
      this.request.status !== this.status.DRAFT
    );
  }

  get isRequest(): boolean {
    return this.id && this.request && this.request.status === this.status.REQUEST;
  }

  get isDraft(): boolean {
    return this.id && this.request && this.request.status === this.status.DRAFT;
  }

  get isSw1(): boolean {
    const { status } = this.request;
    return this.id && status === this.status.SW1;
  }

  get isSw2(): boolean {
    const { status } = this.request;
    return this.id && (status === this.status.SW2 || this.isSw2Submit);
  }

  get isSw2Submit(): boolean {
    const { status } = this.request;
    return this.id && status === this.status.SW2SUBMIT;
  }

  get isSubmit(): boolean {
    const { status } = this.request;
    return (
      this.id &&
      (status === this.status.SUBMIT || this.isSw1 || this.isSw2 || this.isSw2Submit || this.isCompleted) &&
      status !== this.status.DRAFT
    );
  }

  get isCompleted(): boolean {
    const { status } = this.request;
    return this.id && status === this.status.END;
  }

  get isOwner(): boolean {
    const { owners } = this.request;
    return this.user && owners && owners.findIndex(obj => obj.name === this.user.name) > -1;
  }

  get isOwnerD4D8(): boolean {
    const { ownersD4d8 } = this.request;
    return this.user && ownersD4d8 && ownersD4d8.findIndex(obj => obj.name === this.user.name) > -1;
  }

  get isRequestor(): boolean {
    const { oldIssueByName } = this.request;
    return (
      this.user &&
      oldIssueByName &&
      oldIssueByName
        .split(' ')[0]
        .trim()
        .toUpperCase() === this.user.empId.trim().toUpperCase()
    );
  }

  get isFuQa() {
    console.log('isFuQa: ', this.request ? this.request.fuqa : []);
    return (
      this.request.fuqa?.length > 0 &&
      this.user?.empId !== 'empId' &&
      this.request.fuqa.findIndex(obj => obj.empId === this.user.empId) > -1
    );
  }

  get isPemQa(): boolean {
    console.log('isPemQa: ', this.request ? this.request.pemqa : []);
    return (
      this.request.pemqa?.length > 0 &&
      this.user?.empId !== 'empId' &&
      this.request.pemqa.findIndex(obj => obj.empId === this.user.empId) > -1
    );
  }

  get isPeTe(): boolean {
    return this.user?.empId !== 'empId' && this.user.roles.findIndex(obj => obj === 'PETE') > -1;
  }

  get isMte(): boolean {
    console.log('isMte(all)');
    return (
      (this.request.mteEngineers?.length > 0 &&
        this.user?.empId !== 'empId' &&
        this.request.mteEngineers.findIndex(obj => obj.empId === this.user.empId) > -1) ||
      (this.request.mteManagers?.length > 0 &&
        this.user?.empId !== 'empId' &&
        this.request.mteManagers.findIndex(obj => obj.empId === this.user.empId) > -1)
    );
  }

  get isManager(): boolean {
    console.log('isMte(Manager): ', this.request ? this.request.mteManagers : []);
    return (
      this.request.mteManagers?.length > 0 &&
      this.user?.empId !== 'empId' &&
      this.request.mteManagers.findIndex(obj => obj.empId === this.user.empId) > -1
    );
  }

  get isEngineer(): boolean {
    console.log('isMte(Engineer): ', this.request ? this.request.mteEngineers : []);
    return (
      this.request.mteEngineers?.length > 0 &&
      this.user?.empId !== 'empId' &&
      this.request.mteEngineers.findIndex(obj => obj.empId === this.user.empId) > -1
    );
  }

  get isMember(): boolean {
    const idx: number = this.request.members
      ? this.request.members.findIndex(obj => {
          return this.user.empId === obj.empId;
        })
      : -1;
    return idx > -1;
  }

  get isEditingBy(): boolean {
    if (this.id && this.request.editingBy && this.request.editingBy !== 'null') {
      if (this.user?.empId !== 'empId' && this.user.name === this.request.editingBy) {
        return true;
      }
    }
    return false;
  }

  get isInstruction(): boolean {
    let fact: boolean = true;
    for (let i = 0; i < this.request.lots.length; i++) {
      switch (this.request.lots[i].disposition) {
        case 'N':
          fact = false;
          break;
        case 'I':
          fact = false;
          break;
        case 'W':
          fact = false;
          break;
      }
    }
    return this.request.lots.length > 0 && fact;
  }

  get isMerged(): boolean {
    if (
      this.request &&
      this.request.status === this.status.MERGE &&
      this.request.mergeBy &&
      this.request.mergeWithId &&
      this.request.mergeWithNumber
    ) {
      return true;
    }
    return false;
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D1').value : 'Loading';
  }
}
