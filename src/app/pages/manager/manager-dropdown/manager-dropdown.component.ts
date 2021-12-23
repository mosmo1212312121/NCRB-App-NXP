import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { ResponseObj } from '../../../interfaces';
import { AjaxService, DropdownService, LogService } from '../../../services';
import { alertSuccess } from '../../../utils';
import { AddDropdownModalComponent } from './add-dropdown.modal';
import { EditDropdownModalComponent } from './edit-dropdown.modal';

@Component({
  selector: 'app-manager-dropdown',
  templateUrl: './manager-dropdown.component.html'
})
export class ManagerDropdownComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  problemTypes: NxpSelection[] = [];
  mfgs: NxpSelection[] = [];
  issueByGroups: NxpSelection[] = [];
  subMfgs: NxpSelection[] = [];
  shifts: NxpSelection[] = [];
  problemProcesses: NxpSelection[] = [];
  specials: NxpSelection[] = [];
  stopAndFixes: NxpSelection[] = [];
  faCodes: NxpSelection[] = [];
  categories: NxpSelection[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  submit: boolean = false;
  constructor(
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/dropdown-management');

    this.form = this.fb.group({
      mfg: [''],
      subMfg: ['']
    });
  }

  async ngOnInit() {
    try {
      let response: ResponseObj = null;
      response = await this.dropdown.getDropdownByGroup('PROBLEM').toPromise();
      this.problemTypes = response.data;
      response = await this.dropdown.getDropdownByGroup('MFG').toPromise();
      this.mfgs = response.data;
      response = await this.dropdown.getDropdownByGroup('ISSUEBY').toPromise();
      this.issueByGroups = response.data;
      response = await this.dropdown.getDropdownByGroup('SHIFT').toPromise();
      this.shifts = response.data;
      response = await this.dropdown.getDropdownByGroup('SPECIAL').toPromise();
      this.specials = response.data;
      response = await this.dropdown.getDropdownByGroup('STOPNFIX').toPromise();
      this.stopAndFixes = response.data;
      response = await this.dropdown.getDropdownByGroup('FACODE').toPromise();
      this.faCodes = response.data;
      response = await this.dropdown.getDropdownByGroup('CATEGORY').toPromise();
      this.categories = response.data;

      /* Initial Selection */
      this.form.get('mfg').patchValue(this.mfgs[0].value);
      await this.onMfgChange(this.mfgs[0].value);
      this.form.get('subMfg').patchValue(this.subMfgs[0].value);
      await this.onSubMfgChange(this.subMfgs[0].value);
    } catch (ex) {
      // On Crashed
      console.error('Manager Dropdown (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  async onMfgChange(evt) {
    if (evt && typeof evt !== 'object') {
      // TODO
      try {
        const idx: number = this.mfgs.findIndex(obj => obj.value.toString() === evt.toString());
        if (idx > -1) {
          const response: ResponseObj = await this.dropdown
            .getDropdown(this.mfgs[idx].id.toString(), 'AREA')
            .toPromise();
          this.subMfgs = response.data;
          this.form.get('subMfg').patchValue(this.subMfgs[0].value);
          await this.onSubMfgChange(this.subMfgs[0].value);
        }
      } catch (ex) {
        // On Crashed
        console.error('Manager Dropdown (Mfg Change) Errors: ', ex);
      }
    } else {
      this.subMfgs = [];
    }
  }

  async onSubMfgChange(evt) {
    if (evt && typeof evt !== 'object') {
      // TODO
      try {
        const idx: number = this.subMfgs.findIndex(obj => obj.value.toString() === evt.toString());
        if (idx > -1) {
          const response: ResponseObj = await this.dropdown
            .getDropdown(this.subMfgs[idx].id.toString(), 'PROBLEMPROCESS')
            .toPromise();
          this.problemProcesses = response.data;
        }
      } catch (ex) {
        // On Crashed
        console.error('Manager Dropdown (SubMfg Change) Errors: ', ex);
      }
    } else {
      this.problemProcesses = [];
    }
  }

  async onAddIssueByGroup() {
    const title: string = 'Issue By Group';
    const groupName: string = 'ISSUEBY';
    const value: number = parseInt(this.issueByGroups[this.issueByGroups.length - 1].value, 10) + 1;
    await this.onAdding(title, groupName, value);
  }

  async onAddShift() {
    const title: string = 'Shift';
    const groupName: string = 'SHIFT';
    const value: number = parseInt(this.shifts[this.shifts.length - 1].value, 10) + 1;
    await this.onAdding(title, groupName, value);
  }

  async onAddSpecial() {
    const title: string = 'Special';
    const groupName: string = 'SPECIAL';
    const value: number = parseInt(this.specials[this.specials.length - 1].value, 10) + 1;
    await this.onAdding(title, groupName, value);
  }

  async onAddStopNFix() {
    const title: string = 'Stop & Fix';
    const groupName: string = 'STOPNFIX';
    const value: number = parseInt(this.stopAndFixes[this.stopAndFixes.length - 1].value, 10) + 1;
    await this.onAdding(title, groupName, value);
  }

  async onAddFaCode() {
    const title: string = 'FA Code';
    const groupName: string = 'FACODE';
    const value: number = parseInt(this.faCodes[this.faCodes.length - 1].value, 10) + 1;
    await this.onAdding(title, groupName, value);
  }

  async onAddCategory() {
    const title: string = 'Category';
    const groupName: string = 'CATEGORY';
    const value: number = parseInt(this.categories[this.categories.length - 1].value, 10) + 1;
    await this.onAdding(title, groupName, value);
  }

  async onAdding(title: string, groupName: string, value: number) {
    try {
      this.bsModalRef = this.modalService.show(AddDropdownModalComponent, {
        ignoreBackdropClick: true,
        class: 'modal-lg modal-dialog-centered',
        initialState: {
          title: title,
          data: {
            groupName: groupName,
            value: value,
            label: ''
          }
        }
      });
      this.bsModalRef.content.event.subscribe(async (data: NxpSelection) => {
        try {
          this.loading = true;
          const response = await this.dropdown.createDropdown(data).toPromise();
          if (response.status === 200) {
            alertSuccess().then(() => {
              this.fetching();
            });
          }
        } catch (ex) {
          console.error('Manager Dropdown (Creating) ' + title + ' Errors: ', ex);
        } finally {
          this.loading = false;
        }
      });
    } catch (ex) {
      // On Crashed
      console.error('Manager Dropdown (Adding) ' + title + ' Errors: ', ex);
    }
  }

  async onEdit(id: number) {
    try {
      const response = await this.dropdown.getDropdownById(id).toPromise();
      if (response.status === 200 && response.data) {
        this.bsModalRef = this.modalService.show(EditDropdownModalComponent, {
          ignoreBackdropClick: true,
          class: 'modal-lg modal-dialog-centered',
          initialState: {
            data: response.data
          }
        });
        this.bsModalRef.content.event.subscribe((data: NxpSelection) => {
          // TODO
        });
      }
    } catch (ex) {
      // On Crashed
      console.error('Manager Dropdown (Editing) Errors: ', ex);
    }
  }

  async onRemove(id: string) {
    try {
      const response = await this.dropdown.removeDropdown(id).toPromise();
      if (response.status === 200) {
        alertSuccess().then(() => {
          this.fetching();
        });
      }
    } catch (ex) {
      // On Crashed
      console.error('Manager Dropdown (Removing) Errors: ', ex);
    }
  }

  async fetching() {
    localStorage.removeItem('dropdowns');
    await this.dropdown.getDropdowns(true).toPromise();
    let response: ResponseObj = null;
    response = await this.dropdown.getDropdownByGroup('PROBLEM').toPromise();
    this.problemTypes = response.data;
    response = await this.dropdown.getDropdownByGroup('MFG').toPromise();
    this.mfgs = response.data;
    response = await this.dropdown.getDropdownByGroup('ISSUEBY').toPromise();
    this.issueByGroups = response.data;
    response = await this.dropdown.getDropdownByGroup('SHIFT').toPromise();
    this.shifts = response.data;
    response = await this.dropdown.getDropdownByGroup('SPECIAL').toPromise();
    this.specials = response.data;
    response = await this.dropdown.getDropdownByGroup('STOPNFIX').toPromise();
    this.stopAndFixes = response.data;
    response = await this.dropdown.getDropdownByGroup('FACODE').toPromise();
    this.faCodes = response.data;
  }
}
