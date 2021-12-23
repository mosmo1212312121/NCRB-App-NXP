import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { BaseComponent } from '../../components';
import { DateConstant, Status } from '../../constants';
import {
  ContainmentAction,
  Initial,
  IStatus,
  Minute,
  Owner,
  Parameter,
  ResponseObj,
  Score,
  User
} from '../../interfaces';
import {
  AjaxService,
  AuthService,
  BoardGroupService,
  ComponentCanDeactivate,
  DropdownService,
  LogService,
  MockService
} from '../../services';
import { sethistories, setrequest } from '../../store/actions';
import { initialRequest } from '../../store/reducers';
import { IAppState } from '../../store/store';
import { alertConfirm, alertSuccess, alertWarning, filterByName, SwalConfig } from '../../utils';
import { ChangeOwnerComponent } from './modals/change-owner.component';
import { MergeComponent } from './modals/merge.component';
import { OwnersComponent } from './modals/owners.component';

@Component({
  templateUrl: 'request-detail.component.html',
  styles: [
    `
      .go-to {
        cursor: pointer;
      }
      .go-to:hover {
        font-weight: 500;
      }

      .go-to:hover .go-to:before {
        content: '#';
      }
    `
  ]
})
export class RequestDetailComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  formIn: FormGroup;
  lots: FormArray;
  lotsRemove: number[] = [];
  d3Ca: boolean = false;
  d3CaCd: boolean = false;
  d3Qa: ContainmentAction[] = [];
  d3Rc: ContainmentAction[] = [];
  d4: boolean = false;
  d5PCa: boolean = false;
  d5PCaCd: boolean = false;
  d6: boolean = false;
  d7Pr: boolean = false;
  d7PrCd: boolean = false;
  d8: boolean = false;
  d3Moms: Minute[] = [];
  typeName: string = '';
  submit: boolean = false;
  id: number = null;
  from: string = null;
  score: Score;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  _status: IStatus = null;
  iStatusSub: any = null;
  status: Status = new Status();
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  ownerFilter = filterByName;
  testerClickIdx: number = -1;
  bsModalRef: BsModalRef;

  loading: boolean = false;
  isCollapsed: boolean = true;
  hasChange: boolean = false;

  currentSection = 'D1';

  d2Collapse: boolean = false;
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private dropdown: DropdownService,
    private modalService: BsModalService,
    private boardGroup: BoardGroupService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('requests/detail');

    this.form = this.fb.group({
      /* Section 1 */
      ncnumber: [{ value: null, disabled: true }, Validators.required],
      date: [{ value: new Date(), disabled: true }, Validators.required],
      problemType: [null, Validators.required], // null
      issueByName: ['', Validators.required],
      mfg: [null, Validators.required], // null
      issueByGroup: [null, Validators.required],
      subMfg: [null, Validators.required],
      shift: [null, Validators.required],
      problemProcess: [null, Validators.required],
      special: [1], // Default `No`
      stopAndFix: [null, Validators.required],
      operation: [{ value: null, disabled: true }, Validators.required]
      /* Section 1 */
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.iStatusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      this._status = status;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
    });
  }

  async ngOnInit() {
    /* get lists */

    /* Get data from server */
    const id = this.route.snapshot.paramMap.get('id');
    const by = this.route.snapshot.queryParams['by'];
    if (by) {
      this.from = by;
    }
    this.id = id ? parseInt(id, 10) : null;
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.store.dispatch(setrequest(initialRequest));
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  scrollTo(section) {
    document.querySelector('#' + section).scrollIntoView();
  }

  async onSubmitRequest() {
    this.request.submit = true;

    if (this.request.owners.length === 0) {
      alertWarning('Please add owner least 1 or more than', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (!this.request.d1Valid) {
      alertWarning('Please fill D1 form..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (!this.request.d2Valid) {
      alertWarning('Please fill D2 form..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (!this.request.d2LotValid && !this.request.isHuman) {
      alertWarning('Please enter some lot..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (this.request.isMaterial && !this.request.isHuman && !this.request.d2LotMaterialValid) {
      alertWarning('Please enter lot details..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (
      this.request.d1Valid &&
      this.request.d2Valid &&
      (this.request.isHuman ||
        (this.request.d2LotValid && !this.request.isHuman) ||
        (this.request.d2LotMaterialValid && !this.request.isHuman))
    ) {
      let response: ResponseObj = await this.ajax.getNcNumber().toPromise();
      let rejectName = null;
      if ((this.request.isMaterial || this.isWaferFAB) && this.materialHoldCode) {
        const materials = JSON.parse(localStorage.getItem('materialTypes'));
        for (let i = 0; i < materials.length; i++) {
          if (materials[i].id === this.request.materialType) {
            rejectName = materials[i];
          }
        }

        rejectName = {
          ...rejectName,
          ...{
            holdCode: this.materialHoldCode.split(' - ')[0]
          }
        };
      } else {
        const rejects = (await this.dropdown.getDropdownReject().toPromise()).data;
        for (let i = 0; i < rejects.length; i++) {
          if (rejects[i].id === this.request.rejectName) {
            rejectName = rejects[i];
          }
        }
      }

      const rs = await alertConfirm(
        `<div class="text-left">
            <p>NC Number.. <strong>${this.request.ncnumber}</strong></p>
            <p>${this.request.isMaterial || this.isWaferFAB ? 'Material type..' : 'Reject Name..'} <strong>${
          rejectName.codeName
        }</strong></p>
            <p>Hold Reason.. <strong>${rejectName.holdCode}</strong></p>
            <p>Hold Comment.. <strong>${this.request.ncnumber} ${rejectName.codeName}</strong></p>
            </div>`,
        'Auto hold result'
      );
      if (rs.value) {
        this.hasChange = false;
        this.loading = true;
        try {
          response = await this.ajax
            .submitDraftRequest({
              ...this.request,
              ...{ holdReason: rejectName.holdCode, rejectCode: rejectName.codeName }
            })
            .toPromise();
          if (response.status === 200) {
            alertSuccess(
              `<p>Submitting form request !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
              'Successful!',
              () => {
                this.hasChange = false;
                this.request.submit = false;
                if (this.user?.empId !== 'empId') {
                  this.router.navigate(['requests/mylists/issue']);
                } else {
                  this.router.navigate(['requests/list']);
                }
              }
            );
          }
        } catch (ex) {
          // on crash
          console.error('Request Detail (Submit Request) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    } else {
      this.store.dispatch(setrequest(this.request));
    }
  }

  onSaveDraft() {
    this.hasChange = false;

    if (!this.request.problemType) {
      alertWarning('Please fill Problem Type form..', 'Validation');
      return;
    }

    alertConfirm('Please check your change before save draft', 'Are you sure ?', async result => {
      if (result) {
        try {
          this.loading = true;
          let response: ResponseObj = await this.ajax
            .saveDraftRequest(Object.assign(this.request, { actionName: this.user.username }))
            .toPromise();
          if (response.status === 200) {
            this.request = Object.assign({}, this.request, response.data.info);
            this.hasChange = false;
            this.request.submit = false;
            this.store.dispatch(setrequest(this.request));

            response = await this.ajax.getHistoryByNcrbno(this.request.ncnumber.toString()).toPromise();
            if (response.status === 200) {
              const histories = response.data;
              histories.map(obj => {
                obj.commentDate = new Date(obj.commentDate);
                return obj;
              });
              this.store.dispatch(sethistories({ histories: histories }));
            }
            alertSuccess(
              `<p>Submitting form request !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
              'Successful!'
            );
          }
        } catch (ex) {
          // on crash
          console.error('Request Detail (Save Draft) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onRemoveDraft() {
    this.hasChange = false;
    alertConfirm('Please check request before delete your draft', 'Are you sure ?', async result => {
      if (result) {
        try {
          const response: ResponseObj = await this.ajax.removeDraftRequest(this.request).toPromise();
          if (response.status === 200) {
            alertSuccess(
              `<p>Delete your draft !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
              'Successful!',
              () => {
                this.hasChange = false;
                this.request.submit = false;
                this.router.navigate([`requests/mylists`]);
              }
            );
          }
        } catch (ex) {
          // on crash
          console.error('Request Detail (Remove Draft) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  async onSubmit(status?: string) {
    this.submit = true;
    if (this.form.valid) {
      /* Manage data */
      const data: Initial = this.form.getRawValue();
      data.lots = this.formIn.getRawValue().lots;
      data.lotsRemove = this.lotsRemove;
      data.date = moment(data.date, this.dateConstant.format.toUpperCase()).toDate();
      if (status) {
        data.status = status;
      }
      /* Manage data */
      this.loading = true;
      try {
        const response: ResponseObj = await this.ajax.updateRequest(data).toPromise();
        if (response.status === 200) {
          alertSuccess(
            `<p>Submitting form request !</p>
          <span style="color: green; white-space: pre-line;">Successfully !</span>`,
            'Successful!',
            () => {
              this.hasChange = false;
              if (this.user?.empId !== 'empId') {
                this.router.navigate(['requests/mylists']);
              } else {
                this.router.navigate(['requests/list']);
              }
            }
          );
        }
      } catch (ex) {
        // on crash
        console.error('Request Detail (Update Request) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.hasChange = false;
          this.loading = false;
        }, 50);
      }
    }
  }

  onSubmitAll() {
    this.submit = true;
    alertConfirm('Make sure, Do you want to `Submit` ?', 'Are you sure ?', async result => {
      if (result.value) {
        const auth: string = localStorage.getItem('basic_auth'); // `${btoa('WBI\\' + result.value.username)}:${btoa(result.value.password)}`;
        let PEMQA: string = '';
        const idx: number = this.params.findIndex(obj => obj.label === 'PEMQA');
        if (idx > -1) {
          PEMQA = this.params[idx].value;
        }
        try {
          this.loading = true;
          const response: ResponseObj = await this.ajax
            .getSubmit(this.id, auth, PEMQA, this._status.isD12D3, this._status.isD12D8, this._status.isD12D83x5Why)
            .toPromise();
          if (response.status === 200) {
            this.request.date = moment(this.request.date, this.dateConstant.format.toUpperCase()).toDate();
            this.request.id = this.id;
            const resp: ResponseObj = await this.ajax.updateRequest(this.request).toPromise();
            if (resp.status === 200) {
              alertSuccess(
                `<p>Submitting form request !</p>
                  <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                'Successful!',
                () => {
                  this.hasChange = false;
                  this.router.navigate([`/requests/list`], { skipLocationChange: true });
                }
              );
            }
          }
        } catch (ex) {
          // On Crashed
          console.error('Request Detail (Submit Request All Form) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  public async onBoardApprove(groupReqId: number) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        this.loading = true;
        const ncrbId: number = this.request.id;
        const approver: string = this.user.name;
        let response = await this.boardGroup.approveBoardNCRB(ncrbId, groupReqId, approver).toPromise();
        if (response.data) {
          const auth: string = localStorage.getItem('basic_auth');
          response = await this.ajax
            .getCompleteNCRB(this.id, auth, this._status.isD12D3, this._status.isD12D8, this._status.isD12D83x5Why)
            .toPromise();
          this.loading = false;
          await alertSuccess();
          window.location.reload();
        }
      }
    } catch (err) {
      console.log('onBoardApprove Error: ', err);
    } finally {
      this.loading = false;
    }
  }

  public async onBoardReject(groupReqId: number) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        this.loading = true;
        const ncrbId: number = this.request.id;
        const approver: string = this.user.name;
        const response = await this.boardGroup.rejectBoardNCRB(ncrbId, groupReqId, approver).toPromise();
        if (response.data) {
          this.loading = false;
          await alertSuccess();
          window.location.reload();
        }
      }
    } catch (err) {
      console.log('onBoardReject Error: ', err);
    } finally {
      this.loading = false;
    }
  }

  public approvable(groupReqId: number): boolean {
    const boardGroupReqNCRB = this.request.boardGroupReqNCRBs.find(o => o.groupReqId === groupReqId);
    if (boardGroupReqNCRB) {
      if (this.user) {
        const idx: number = boardGroupReqNCRB.members.findIndex(m => m.memberWBI === this.user.username);
        return idx > -1;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onSubmitToManager() {
    this.submit = true;
    alertConfirm('Make sure, Do you want to `Submit` ?', 'Are you sure ?', async result => {
      if (result.value) {
        const auth: string = localStorage.getItem('basic_auth'); // `${btoa('WBI\\' + result.value.username)}:${btoa(result.value.password)}`;
        let PEMQA: string = '';
        const idx: number = this.params.findIndex(obj => obj.label === 'PEMQA');
        if (idx > -1) {
          PEMQA = this.params[idx].value;
        }
        try {
          this.loading = true;
          if (this._status.isD12D3) {
            if (this.request.boardGroups) {
              const boardGroups = [];
              for (let i = 0; i < this.request.boardGroups.length; i++) {
                const { groupId, needDevice, needQrb, needMrb } = this.request.boardGroups[i];
                const ncrbId = this.request.id;
                if (needDevice) {
                  boardGroups.push(
                    this.boardGroup.createBoardNCRB(groupId, ncrbId, needDevice, needQrb, needMrb).toPromise()
                  );
                }
              }
              await Promise.all(boardGroups);
            }
          }
          const response: ResponseObj = await this.ajax
            .getSubmit2Manager(
              this.id,
              auth,
              PEMQA,
              this._status.isD12D3,
              this._status.isD12D8,
              this._status.isD12D83x5Why
            )
            .toPromise();
          if (response.status === 200) {
            this.request.date = moment(this.request.date, this.dateConstant.format.toUpperCase()).toDate();
            this.request.id = this.id;
            const resp: ResponseObj = await this.ajax.updateRequest(this.request).toPromise();
            if (resp.status === 200) {
              alertSuccess(
                `<p>Submitting form request !</p>
                  <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                'Successful!',
                () => {
                  this.hasChange = false;
                  this.router.navigate([`/requests/list`], { skipLocationChange: true });
                }
              );
            }
          }
        } catch (ex) {
          // On Crashed
          console.error('Request Detail (Submit Request All Form) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onSubmitToBoard() {
    this.submit = true;
    alertConfirm('Make sure, Do you want to `Submit` ?', 'Are you sure ?', async result => {
      if (result.value) {
        const auth: string = localStorage.getItem('basic_auth'); // `${btoa('WBI\\' + result.value.username)}:${btoa(result.value.password)}`;
        try {
          this.loading = true;
          if (this.request.boardGroups) {
            const boardGroups = [];
            for (let i = 0; i < this.request.boardGroups.length; i++) {
              const { groupId, needDevice, needQrb, needMrb } = this.request.boardGroups[i];
              const ncrbId = this.request.id;
              if ((needQrb && this._status.isD12D8) || (needMrb && this._status.isD12D83x5Why)) {
                boardGroups.push(
                  this.boardGroup.createBoardNCRB(groupId, ncrbId, needDevice, needQrb, needMrb).toPromise()
                );
              }
            }
            await Promise.all(boardGroups);
          }
          const response: ResponseObj = await this.ajax
            .getSubmit2Board(this.id, auth, this._status.isD12D3, this._status.isD12D8, this._status.isD12D83x5Why)
            .toPromise();
          if (response.status === 200) {
            this.request.date = moment(this.request.date, this.dateConstant.format.toUpperCase()).toDate();
            this.request.id = this.id;
            const resp: ResponseObj = await this.ajax.updateRequest(this.request).toPromise();
            if (resp.status === 200) {
              alertSuccess(
                `<p>Submitting form request !</p>
                  <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                'Successful!',
                () => {
                  this.hasChange = false;
                  this.router.navigate([`/requests/list`], { skipLocationChange: true });
                }
              );
            }
          }
        } catch (ex) {
          // On Crashed
          console.error('Request Detail (Submit Request All Form) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onSubmitByPEMQA(): void {
    this.submit = true;
    alertConfirm('Make sure, Do you want to `Submit` ?', 'Are you sure ?', async result => {
      if (result.value) {
        const auth: string = localStorage.getItem('basic_auth'); // `${btoa('WBI\\' + result.value.username)}:${btoa(result.value.password)}`;
        this.loading = true;
        try {
          const response: ResponseObj = await this.ajax
            .getSubmitPEMQA(this.id, {
              auth,
              isD12D3: this._status.isD12D3,
              isD12D8: this._status.isD12D8,
              isD12D83x5Why: this._status.isD12D83x5Why
            })
            .toPromise();
          if (response.status === 200) {
            this.request.date = moment(this.request.date, this.dateConstant.format.toUpperCase()).toDate();
            if (status) {
              this.request.status = status;
            }
            this.request.id = this.id;
            alertSuccess(
              `<p>Submitting form request !</p>
            <span style="color: green; white-space: pre-line;">Successfully !</span>`,
              'Successful!',
              () => {
                this.hasChange = false;
                this.router.navigate([`/requests/list`], { skipLocationChange: true });
              }
            );
          }
        } catch (ex) {
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onAcknowledge(): void {
    this.submit = true;
    this.request.submit = true;
    if (!this.request.d1Valid) {
      alertWarning('Please fill D1 form..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (!this.request.d2Valid) {
      alertWarning('Please fill D2 form..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (!this.request.d2LotValid && !this.request.isHuman && !this.isWaferFAB) {
      alertWarning('Please enter some lot..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (this.request.isMaterial && !this.request.isHuman && !this.request.d2LotMaterialValid) {
      alertWarning('Please enter lot details..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    alertConfirm('Make sure, Do you want to `Acknowledge` ?', 'Are you sure ?', async result => {
      if (result.value) {
        const auth: string = localStorage.getItem('basic_auth'); // `${btoa('WBI\\' + result.value.username)}:${btoa(result.value.password)}`;
        this.loading = true;
        try {
          let response: ResponseObj = await this.ajax.getAcknowledge(this.id, auth).toPromise();
          if (response.status === 200) {
            this.request.date = moment(this.request.date, this.dateConstant.format.toUpperCase()).toDate();
            if (status) {
              this.request.status = status;
            }
            this.request.id = this.id;
            response = await this.ajax.updateRequest(this.request).toPromise();
            if (response.status === 200) {
              alertSuccess(
                `<p>Submitting form request !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
                'Successful!',
                () => {
                  this.hasChange = false;
                  this.router.navigate([`/requests/list`], { skipLocationChange: true });
                }
              );
            }
          }
        } catch (ex) {
          console.error('Request Detail (Acknowledge) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  onOwners() {
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
      this.onChange();
    });
  }

  onChangeOwnerClick(): void {
    this.bsModalRef = this.modalService.show(ChangeOwnerComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        currentOwner: this.user.name,
        currentUser: this.user.name,
        isPemQa: this.request.isPemQa
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: string) => {
      const auth: string = localStorage.getItem('basic_auth');
      this.loading = true;
      try {
        const response: ResponseObj = await this.ajax
          .getChangeOwner(this.request.id, data, auth, this.request.isSubmit)
          .toPromise();
        if (response.data) {
          alertSuccess(
            `<p>ChangeOwner to "${data}" !</p>
          <span style="color: green; white-space: pre-line;">Successfully !</span>`,
            'Successful!',
            () => {
              this.hasChange = false;
              this.router.navigate([`/requests/list`], { skipLocationChange: true });
            }
          );
        }
      } catch (ex) {
        console.error('Request Detail (Change Owner) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.hasChange = false;
          this.loading = false;
        }, 50);
      }
    });
  }

  onMergeView() {
    window.open(`${environment.hostUrl}/requests/detail/${this.request.mergeWithId}`);
  }

  onD3SubmitRc(event: ContainmentAction[]): void {
    if (this.d3Rc.length > 0) {
      this.hasChange = true;
    }
    this.d3Rc = event;
    this.onChange();
  }

  onD3SubmitQa(event: ContainmentAction[]): void {
    if (this.d3Qa.length > 0) {
      this.hasChange = true;
    }
    this.d3Qa = event;
    this.onChange();
  }

  onD3SubmitCa(event: boolean): void {
    if (this.d3Ca) {
      this.hasChange = true;
    }
    this.d3Ca = event;
    this.onChange();
  }

  onD5SubmitPCa(event: boolean): void {
    if (this.d5PCa) {
      this.hasChange = true;
    }
    this.d5PCa = event;
    this.onChange();
  }

  onD7SubmitPr(event: boolean): void {
    if (this.d7Pr) {
      this.hasChange = true;
    }
    this.d7Pr = event;
    this.onChange();
  }

  onD3CaCd(event: boolean): void {
    if (this.d3CaCd) {
      this.hasChange = true;
    }
    this.d3CaCd = event;
    this.onChange();
  }

  onD5PCaCd(event: boolean): void {
    if (this.d5PCaCd) {
      this.hasChange = true;
    }
    this.d5PCaCd = event;
    this.onChange();
  }

  onD7PrCd(event: boolean): void {
    if (this.d7PrCd) {
      this.hasChange = true;
    }
    this.d7PrCd = event;
    this.onChange();
  }

  onD3SubmitMom(event: Minute[]): void {
    if (this.d3Moms.length > 0) {
      this.hasChange = true;
    }
    this.d3Moms = event;
    this.onChange();
  }

  onD4(event: boolean): void {
    this.d4 = event;
    this.onChange();
  }

  onD6(event: boolean): void {
    this.d6 = event;
  }

  onD8(event: boolean): void {
    this.d8 = event;
  }

  onChange(event?) {
    if (event && typeof event === 'object') {
      return;
    }
    this.request.isSubmitAll = this.isSubmitAll;
    this.request.d3CaCd = this.d3CaCd;
    this.request = Object.assign({}, this.request);
    this.store.dispatch(setrequest(this.request));
  }

  async onBack() {
    if (this.id && this.request.isEditingBy) {
      await this.ajax.updateEditing(this.id, 'null').toPromise();
    }
    if (this.from) {
      if (this.from === 'dashboard') {
        this.router.navigate([`/${this.from}`]);
      } else {
        this.router.navigate([`/requests/${this.from}`]);
      }
    } else {
      this.router.navigate([`/requests/list`]);
    }
  }

  onD2ToggleCollapse(event) {
    this.d2Collapse = event;
  }

  async onMerge() {
    this.bsModalRef = this.modalService.show(MergeComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        ncrbid: this.id
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: Initial) => {
      this.loading = true;
      try {
        console.log('Result : ', data);
        const response: ResponseObj = await this.ajax
          .getMerge(this.request.ncnumber, data.ncnumber, this.user.name)
          .toPromise();
        if (response.data) {
          alertSuccess(
            `<p>Merge NCRB: ${this.request.ncnumber} to ${data.ncnumber} complete !</p>
          <span style="color: green; white-space: pre-line;">Successfully !</span>`,
            'Successful!',
            () => {
              this.hasChange = false;
              this.router.navigate([`/requests/list`], { skipLocationChange: true });
            }
          );
        }
      } catch (ex) {
        console.error('Request Detail (Merge NCRB) Errors: ', ex);
      } finally {
        setTimeout(() => {
          this.hasChange = false;
          this.loading = false;
        }, 50);
      }
    });
  }

  public getBoardGroupReqs() {
    const result: any[] = this.request.boardGroupReqNCRBs
      ? this.request.boardGroupReqNCRBs.filter(o => o.approval === 'REQUEST')
      : [];
    return result.filter(
      o =>
        (o.needDevice && this._status.isD12D3) ||
        (o.needQrb && this._status.isD12D8) ||
        (o.needMrb && this._status.isD12D83x5Why)
    );
  }

  public onGoTo(id): void {
    const el = document.getElementById(id);
    el.scrollIntoView();
  }

  public iconTaskComplete(fact: boolean): string {
    return fact ? '<i class="fa fa-check mr-1"></i>' : '<i class="fa fa-times mr-1"></i>';
  }

  get isMergeAndD3(): boolean {
    let fact: boolean = false;
    for (let i = 0; i < this.request.lots.length; i++) {
      if (this.request.lots[i].disposition !== 'N') {
        fact = true;
      }
    }
    return this.request.isMerged && fact;
  }

  get isSubmitAll() {
    // D3.1: RC
    const RC: boolean = this.d3Rc.length > 0;
    // D3.2: QA
    const QA: boolean = this.d3Qa.length > 0 && !this.d3Qa[this.d3Qa.length - 1].reason;
    // D3.3: CA
    const CA: boolean = this.d3Ca;
    // D3.3: Moms
    const Moms: boolean = this._status.isD12D8 || this._status.isD12D83x5Why ? this.d3Moms.length > 0 : true;
    // D3.4: Moms
    const LDI: boolean = this.request.isInstruction;
    // D3.5: Lot Disposition
    const LD: boolean = this.request.isApproveAll;
    // D3.6: Material Disposition
    const MD: boolean = this.request.isApproveAllMat;

    return (
      RC &&
      QA &&
      CA &&
      Moms &&
      (LDI || this.isWaferFAB) &&
      (LD || this.isWaferFAB) &&
      (this.request.isMaterial ? MD : true)
    );
  }

  get isAllComplete(): boolean {
    // D4: Failure analysis and root cause / escape point
    const D4: boolean = this.d4;
    // D5: Permanent corrective actions
    const D5: boolean = this.d5PCa;
    // D6: Implement and verification of corrective actions
    const D6: boolean = this.d6;
    // D7: Prevent Recurrence
    const D7: boolean = this.d7Pr;
    // D8: Report
    const D8: boolean = this.d8;
    if (this._status.isD12D8 || this._status.isD12D83x5Why) {
      return this.isSubmitAll && D4 && D5 && D6 && D7 && D8;
    }

    return this.isSubmitAll;
  }

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }

  get D1_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D1').value : 'Loading';
  }

  get D2_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D2').value : 'Loading';
  }

  get MOM_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_MOM').value : 'Loading';
  }

  get D3_1_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_1').value : 'Loading';
  }

  get D3_2_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_2').value : 'Loading';
  }

  get D3_3_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_3').value : 'Loading';
  }

  get D3_4_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_4').value : 'Loading';
  }

  get D3_5_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_5').value : 'Loading';
  }

  get D3_6_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_6').value : 'Loading';
  }

  get D4_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D4').value : 'Loading';
  }

  get D5_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D5').value : 'Loading';
  }

  get D6_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D6').value : 'Loading';
  }

  get D7_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D7').value : 'Loading';
  }

  get D8_TITLE(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D8').value : 'Loading';
  }

  get materialHoldCode(): string {
    let holdCode: string = '';
    if (this.params.length > 0) {
      const idx: number = this.params.findIndex(o => o.label === 'MATERIAL_HOLDCODE');
      if (idx > -1) {
        holdCode = this.params[idx].value;
      }
    }
    return holdCode;
  }
}
