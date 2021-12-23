import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { Pagination, ResponseObj, User } from '../../../interfaces';
import { AjaxService, DropdownService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertError } from '../../../utils';
import { ManagerOwnersModalComponent } from './manager-owners-modal/manager-owners-modal.component';

@Component({
  selector: 'app-manager-owners',
  templateUrl: './manager-owners.component.html',
  styleUrls: ['./manager-owners.component.scss']
})
export class ManagerOwnersComponent extends BaseComponent implements OnInit, OnDestroy {
  configOwners: any[] = [];
  configOwner: any = null;
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  isD3Owner: boolean[] = [];
  isD4D8Owner: boolean[] = [];
  isMTEEngineers: boolean[] = [];
  isMTEManagers: boolean[] = [];
  isTeamMember: boolean[] = [];
  isDirectors: boolean[] = [];
  isFinances: boolean[] = [];
  isMaterials: boolean[] = [];
  isPEMQA: boolean[] = [];
  isFuqa: boolean[] = [];
  isFABMember: boolean[] = [];
  pagination: Pagination = {
    page: 1,
    pageLength: 24,
    total: 0,
    totalPage: 0
  };
  mfgs: NxpSelection[] = [
    {
      id: -1,
      label: 'All',
      value: 'all',
      createBy: 'SYSTEM',
      text: 'All'
    }
  ];
  subMfgs: NxpSelection[] = [
    {
      id: -1,
      label: 'All',
      value: 'all',
      createBy: 'SYSTEM',
      text: 'All'
    }
  ];
  problemProcesses: NxpSelection[] = [
    {
      id: -1,
      label: 'All',
      value: 'all',
      createBy: 'SYSTEM',
      text: 'All'
    }
  ];
  user: User = null;
  userSub: any = null;
  public form: FormGroup;
  public searching: string = '';
  public fact: boolean = true;

  public uploadProgress: number = 0;
  public uploadTotal: number = 0;
  public uploadPercentage: string = '0%';
  public uploadedFile: string = '';
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private logService: LogService,
    private store: Store<IAppState>
  ) {
    // initial component
    super(logService);
    this.setPageName('management/owners-management');

    this.form = this.fb.group({
      mfg: ['all'],
      subMfg: ['all'],
      problemProcess: ['all']
    });

    this.userSub = this.store.select('user').subscribe(user => {
      if (user.empId !== 'empId') {
        this.user = user;
      }
    });
  }

  async ngOnInit() {
    try {
      this.loading = true;
      // await this.dropdown.getDropdowns().toPromise();
      const results = await this.ajax.getPromiseAll([this.dropdown.getDropdownByGroup('MFG').toPromise()]);
      this.mfgs = [
        {
          id: -1,
          label: 'All',
          value: '',
          createBy: 'SYSTEM',
          text: 'All'
        }
      ];
      this.mfgs = this.mfgs.concat(results[0].data);

      /* get lists */
      await this.onSearching();
    } catch (ex) {
      // On Crashed
      console.error('Manager Owners (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  async onPageChanged(event) {
    try {
      this.loading = true;
      const form = this.form.getRawValue();
      const response: ResponseObj = await this.ajax
        .getOwnersByPagingNew(event.page, this.pagination.pageLength, form.mfg, form.subMfg, form.problemProcess)
        .toPromise();
      if (response.status === 200) {
        this.isD3Owner = [];
        this.isD4D8Owner = [];
        this.isPEMQA = [];
        this.isFuqa = [];
        this.isMTEEngineers = [];
        this.isMTEManagers = [];
        this.isTeamMember = [];
        this.isDirectors = [];
        this.isFinances = [];
        this.isMaterials = [];
        this.isFABMember = [];
        this.configOwners = response.data;
        this.configOwners.forEach((obj, idx) => {
          this.isD3Owner.push(this.fact);
          this.isD4D8Owner.push(this.fact);
          this.isFuqa.push(this.fact);
          this.isPEMQA.push(this.fact);
          this.isMTEEngineers.push(this.fact);
          this.isMTEManagers.push(this.fact);
          this.isTeamMember.push(this.fact);
          this.isDirectors.push(this.fact);
          this.isFinances.push(this.fact);
          this.isMaterials.push(this.fact);
          this.isFABMember.push(this.fact);
        });
        this.pagination.page = event.page;
      }
    } catch (ex) {
      // On Crashed
      console.error('Manager Owners (Page Change) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  onCopyOwners(idx: number) {
    this.configOwner = this.configOwners[idx];
  }

  onEditOwners(idx: number) {
    this.bsModalRef = this.modalService.show(ManagerOwnersModalComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        data: this.configOwners[idx],
        // copy
        copy: this.configOwner
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      try {
        const response: ResponseObj = await this.ajax.saveOwners(data).toPromise();
        if (response.status === 200) {
          // update
          this.configOwners[idx] = response.data;
        }
      } catch (ex) {
        console.error('Manager Owners Errors: ', ex);
      }
    });
  }

  public async onSearching() {
    try {
      this.loading = true;
      const form = this.form.getRawValue();
      let response: ResponseObj = await this.ajax
        .getOwnerPaginationNew(this.pagination.pageLength, form.mfg, form.subMfg, form.problemProcess)
        .toPromise();
      if (response.status === 200) {
        this.pagination = Object.assign({}, this.pagination, response.data);
      }
      response = await this.ajax
        .getOwnersByPagingNew(
          this.pagination.page,
          this.pagination.pageLength,
          form.mfg,
          form.subMfg,
          form.problemProcess
        )
        .toPromise();
      if (response.status === 200) {
        this.isD3Owner = [];
        this.isD4D8Owner = [];
        this.isPEMQA = [];
        this.isFuqa = [];
        this.isMTEEngineers = [];
        this.isMTEManagers = [];
        this.isTeamMember = [];
        this.isDirectors = [];
        this.isFinances = [];
        this.isMaterials = [];
        this.isFABMember = [];
        this.configOwners = response.data;
        this.configOwners.forEach((obj, idx) => {
          if (this.searching) {
            const keys: string[] = ['mfg', 'subMfg', 'problemProcess'];
            for (let i = 0; i < keys.length; i++) {
              this.configOwners[idx][keys[i]] = this.configOwners[idx][keys[i]].replace(
                new RegExp(this.searching, 'g'),
                `<span>${this.searching}</span>`
              );
            }
          }
          this.isD3Owner.push(this.fact);
          this.isD4D8Owner.push(this.fact);
          this.isFuqa.push(this.fact);
          this.isPEMQA.push(this.fact);
          this.isMTEEngineers.push(this.fact);
          this.isMTEManagers.push(this.fact);
          this.isTeamMember.push(this.fact);
          this.isDirectors.push(this.fact);
          this.isFinances.push(this.fact);
          this.isMaterials.push(this.fact);
          this.isFABMember.push(this.fact);
        });
      }
    } catch (ex) {
      // On Crashed
      console.error('Manager Owners (Page Change) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  // public async onSearching() {
  //   try {
  //     this.loading = true;
  //     let response: ResponseObj = await this.ajax
  //       .getOwnerPagination(this.pagination.pageLength, this.searching)
  //       .toPromise();
  //     if (response.status === 200) {
  //       this.pagination = Object.assign({}, this.pagination, response.data);
  //     }
  //     response = await this.ajax
  //       .getOwnersByPaging(this.pagination.page, this.pagination.pageLength, this.searching)
  //       .toPromise();
  //     if (response.status === 200) {
  //       this.isD3Owner = [];
  //       this.isD4D8Owner = [];
  //       this.isPEMQA = [];
  //       this.isFuqa = [];
  //       this.isMTEEngineers = [];
  //       this.isMTEManagers = [];
  //       this.isTeamMember = [];
  //       this.isDirectors = [];
  //       this.isFinances = [];
  //       this.isMaterials = [];
  //       this.isFABMember = [];
  //       this.configOwners = response.data;
  //       this.configOwners.forEach((obj, idx) => {
  //         if (this.searching) {
  //           const keys: string[] = ['mfg', 'subMfg', 'problemProcess'];
  //           for (let i = 0; i < keys.length; i++) {
  //             this.configOwners[idx][keys[i]] = this.configOwners[idx][keys[i]].replace(
  //               new RegExp(this.searching, 'g'),
  //               `<span>${this.searching}</span>`
  //             );
  //           }
  //         }
  //         this.isD3Owner.push(this.fact);
  //         this.isD4D8Owner.push(this.fact);
  //         this.isFuqa.push(this.fact);
  //         this.isPEMQA.push(this.fact);
  //         this.isMTEEngineers.push(this.fact);
  //         this.isMTEManagers.push(this.fact);
  //         this.isTeamMember.push(this.fact);
  //         this.isDirectors.push(this.fact);
  //         this.isFinances.push(this.fact);
  //         this.isMaterials.push(this.fact);
  //         this.isFABMember.push(this.fact);
  //       });
  //     }
  //   } catch (ex) {
  //     // On Crashed
  //     console.error('Manager Owners (Page Change) Errors: ', ex);
  //   } finally {
  //     setTimeout(() => {
  //       this.loading = false;
  //     }, 50);
  //   }
  // }

  async onUploadOwner(event) {
    try {
      this.uploadedFile = '';
      const formData = new FormData();
      formData.append('file', event.target.files[0], `/OWNER/${event.target.files[0].name}`);
      const response: ResponseObj = await this.ajax.uploadOwner(formData).toPromise();

      if (response.status === 200) {
        this.uploadTotal = response.data.specId;
        this.ajax.uploadOwners(response.data.imagePath).toPromise();
        this.updateProgress(response.data.imagePath);
      } else {
        throw response.statusText;
      }
    } catch (ex) {
      console.error('Error on upload owners: ', ex);
    }
  }

  onDownloadSQL() {
    this.ajax.getOwnerSQLFile(new Date().toISOString() + '.sql').toPromise();
  }

  async updateProgress(fileName_) {
    const timer = ms => new Promise(res => setTimeout(res, ms));
    try {
      for (let i = 0; i < this.uploadTotal; i++) {
        const response = await this.ajax.uploadOwnersProgress().toPromise();
        this.uploadProgress = response.data;
        this.uploadPercentage = ((this.uploadProgress / this.uploadTotal) * 100).toFixed(2) + '%';
        if (this.uploadProgress >= this.uploadTotal - 1) {
          this.uploadTotal = 0;
          this.uploadProgress = 0;
          this.uploadPercentage = '0%';
          this.uploadedFile = fileName_.split('\\\\')[2].split('.')[0] + '.sql';
          break;
        }

        await timer(3000);
      }
    } catch (ex) {
      console.error('Error on upload owners: ', ex);
    }
  }

  public onToggleFact() {
    this.fact = !this.fact;
    this.configOwners.forEach((obj, idx) => {
      this.isD3Owner[idx] = this.fact;
      this.isD4D8Owner[idx] = this.fact;
      this.isPEMQA[idx] = this.fact;
      this.isFuqa[idx] = this.fact;
      this.isMTEEngineers[idx] = this.fact;
      this.isMTEManagers[idx] = this.fact;
      this.isTeamMember[idx] = this.fact;
      this.isDirectors[idx] = this.fact;
      this.isFinances[idx] = this.fact;
      this.isMaterials[idx] = this.fact;
      this.isFABMember[idx] = this.fact;
    });
  }

  async onMfgChange(event: string) {
    if (event && typeof event !== 'object') {
      const idx: number = this.mfgs.findIndex(obj => obj.value === event);
      if (idx > -1) {
        try {
          this.loading = true;
          const response = await this.dropdown.getDropdown(this.mfgs[idx].id.toString(), 'AREA').toPromise();
          this.subMfgs = [
            {
              id: -1,
              label: 'All',
              value: 'all',
              createBy: 'SYSTEM',
              text: 'All'
            }
          ];
          this.subMfgs = this.subMfgs.concat(response.data);
          this.submit = false;
        } catch (ex) {
          // On Crashed
          console.error('Owners (Mfg Change) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.form.get('subMfg').patchValue('all');
            this.loading = false;
          }, 1000);
        }
      }
    }
  }

  async onSubMfgChange(event: string) {
    if (event && typeof event !== 'object') {
      const idx: number = this.subMfgs.findIndex(obj => obj.value.toString() === event);
      if (idx > -1) {
        try {
          this.loading = true;
          const response = await this.dropdown
            .getDropdown(this.subMfgs[idx].id.toString(), 'PROBLEMPROCESS')
            .toPromise();

          // fetch problem process
          this.problemProcesses = [
            {
              id: -1,
              label: 'All',
              value: 'all',
              createBy: 'SYSTEM',
              text: 'All'
            }
          ];
          this.problemProcesses = this.problemProcesses.concat(response.data);
          this.submit = false;
        } catch (ex) {
          // On Crashed
          console.error('D1 (SubMfg Change) Errors: ', ex);
        } finally {
          setTimeout(() => {
            this.form.get('problemProcess').patchValue('all');
            this.loading = false;
          }, 1000);
        }
      }
    }
  }

  get isDev(): boolean {
    return (
      this.user &&
      this.user.empId !== 'empId' &&
      this.user.roles.length > 0 &&
      this.user.roles.findIndex(o => o === 'DEV') > -1
    );
  }
}
