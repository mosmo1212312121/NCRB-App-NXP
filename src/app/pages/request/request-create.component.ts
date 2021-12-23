import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { BaseComponent } from '../../components';
import { DateConstant } from '../../constants';
import { Initial, IStatus, Lot, Parameter, ResponseObj, Score, User } from '../../interfaces';
import { AjaxService, ComponentCanDeactivate, DropdownService, LogService } from '../../services';
import { setrequest } from '../../store/actions';
import { initialRequest } from '../../store/reducers';
import { IAppState } from '../../store/store';
import { alertConfirm, alertSuccess, alertWarning, filterByName, SwalConfig } from '../../utils';

@Component({
  templateUrl: 'request-create.component.html'
})
export class RequestCreateComponent extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy, ComponentCanDeactivate {
  id: number = null;
  from: string = null;
  score: Score;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  parameter: Parameter[] = [];
  parameterSub: any = null;
  iStatusSub: any = null;
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  ownerFilter = filterByName;
  typeName: string = '';
  bsModalRef: BsModalRef;

  isSelectProblemTypeAndMfg: boolean = false;
  isInProcess: boolean = false;
  isMaterial: boolean = false;
  isPreviousProcess: boolean = false;
  isOnHold: boolean = false;
  notFinalAndWafer: boolean = false;
  isFinal: boolean = false;
  isWafer: boolean = false;

  loading: boolean = false;
  hasChange: boolean = false;
  d2Collapse: boolean = false;
  constructor(
    private store: Store<IAppState>,
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private router: Router,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('requests/create');

    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
    });
    this.iStatusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      // status.isD12D3;
      // status.isD12D8;
      // status.isD12D83x5Why;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      this.typeName = this.request.typeName;
      this.isSelectProblemTypeAndMfg = this.request.isSelectProblemTypeAndMfg;
      this.isMaterial = this.request.isMaterial;
      this.isPreviousProcess = this.request.isPreviousProcess;
      this.hasChange = this.request.hasChange;
      if (this.request.problemType) {
        if (!this.request.id) {
          this.hasChange = true;
        } else {
          this.hasChange = false;
        }
      }
    });
    this.parameterSub = this.store.pipe(select('parameters')).subscribe((parameter: Parameter[]) => {
      this.parameter = parameter;
    });
  }

  ngOnInit(): void {
    this.store.dispatch(setrequest(initialRequest));
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.parameterSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.store.dispatch(setrequest(initialRequest));
  }

  // @HostListener allows us to also guard against browser refresh, close, etc.
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    // return !this.hasChange || (this.user?.empId === 'empId');
    return true || this.user?.empId === 'empId';
  }

  onSaveDraft() {
    this.hasChange = false;

    if (!this.request.problemType) {
      alertWarning('Please fill problem type..', 'Validation');
      return;
    }

    if (!this.request.issueByName) {
      alertWarning('Please fill issue by..', 'Validation');
      return;
    }

    alertConfirm('Please check your change before save draft', 'Are you sure ?', async result => {
      if (result) {
        try {
          this.loading = true;
          let response: ResponseObj = await this.ajax.saveDraftRequest(this.request).toPromise();
          if (response.status === 200) {
            const ncrbid: number = response.data.info.id;
            if (this.request.attachFiles) {
              for (let i = 0; i < this.request.attachFiles.length; i++) {
                const formData = new FormData();
                const f: string[] = this.request.attachFiles[i].fileName.split('/');
                formData.append('file', this.request.attachFiles[i].file, `${ncrbid}/${f[1]}/${f[2]}`);
                response = await this.ajax.uploadFile(formData).toPromise();
                if (response) {
                  // Do Something
                }
              }
            }
            alertSuccess(
              `<p>Submitting form request !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
              'Successful!',
              () => {
                this.hasChange = false;
                this.request.submit = false;
                localStorage.removeItem('request');
                this.router.navigate([`requests/detail/${ncrbid}`]);
              }
            );
          }
        } catch (ex) {
          // on crash
          console.error('Request Create (Save Draft) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.hasChange = false;
            this.loading = false;
          }, 50);
        }
      }
    });
  }

  async onSubmit() {
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

    if (!this.request.d2LotValid && !this.isHuman && !this.isWaferFAB) {
      alertWarning('Please enter some lot..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if ((this.isMaterial || this.isWaferFAB) && !this.isHuman && !this.request.d2LotMaterialValid) {
      alertWarning('Please enter some material..', 'Validation');
      this.store.dispatch(setrequest(this.request));
      return;
    }

    if (
      this.request.d1Valid &&
      this.request.d2Valid &&
      (this.isHuman ||
        (this.request.d2LotValid && !this.isHuman && !this.isWaferFAB) ||
        (this.request.d2LotMaterialValid && !this.isHuman))
    ) {
      let response: ResponseObj = await this.ajax.getNcNumber().toPromise();
      this.request.ncnumber = response.data;
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
          // Merge roles
          // for (let i = 0; i < this.request.members.length; i++) {
          //   this.request.members[i].role
          // }
          this.request.files = this.request.attachFiles;
          response = await this.ajax
            .saveRequest({ ...this.request, ...{ holdReason: rejectName.holdCode, rejectCode: rejectName.codeName } })
            .toPromise();
          if (response.status === 200) {
            const ncrbid: number = response.data.info.id;
            if (this.request.attachFiles) {
              for (let i = 0; i < this.request.attachFiles.length; i++) {
                const formData = new FormData();
                const f: string[] = this.request.attachFiles[i].fileName.split('/');
                formData.append('file', this.request.attachFiles[i].file, `${ncrbid}/${f[1]}/${f[2]}`);
                response = await this.ajax.uploadFile(formData).toPromise();
              }
            }
            alertSuccess(
              `<p>Submitting form request !</p>
              <span style="color: green; white-space: pre-line;">Successfully !</span>`,
              'Successful!',
              () => {
                this.hasChange = false;
                this.request.submit = false;
                localStorage.removeItem('request');
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
          console.error('Request Create (Submit Request) Errors: ', ex);
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

  onD2ToggleCollapse(event) {
    this.d2Collapse = event;
  }

  get isProduct() {
    return environment.production;
  }

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

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }

  get materialHoldCode(): string {
    let holdCode: string = '';
    if (this.parameter.length > 0) {
      const idx: number = this.parameter.findIndex(o => o.label === 'MATERIAL_HOLDCODE');
      if (idx > -1) {
        holdCode = this.parameter[idx].value;
      }
    }
    return holdCode;
  }

  get isLoggedIn(): boolean {
    return (
      this.user !== null &&
      this.user.username &&
      this.user.username !== 'username' &&
      this.user.empId &&
      this.user.empId !== 'empId'
    );
  }
}
