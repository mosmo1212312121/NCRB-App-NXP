import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { AjaxService, DropdownService } from '../../services';

@Component({
  selector: 'nxp-filter-request',
  templateUrl: './nxp-filter-request.component.html'
})
export class NxpFilterRequestComponent implements OnInit {
  @Input() filter: any = {
    startDate: moment().format('YYYY-01-01'),
    endDate: moment().format('YYYY-MM-DD'),
    assyCg: '',
    failureCode: '',
    faCode: '',
    mfg: '',
    ncrbNumber: '',
    status: '',
    subMfg: '',
    lotId: '',
    productDescription: ''
  };
  @Input() ignore: any = {};
  @Output()
  filterChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();
  public loading: boolean = true;
  public _status = [
    { value: 'Completed', label: 'Completed' },
    { value: 'D3 Processing', label: 'D3 Processing' },
    { value: 'D4-D8 Processing', label: 'D4-D8 Processing' },
    { value: 'Merge', label: 'Merge' },
    { value: 'New NC', label: 'New NC' },
    { value: 'Acknowledged', label: 'Acknowledged' },
    { value: 'Overdue Acknowledge', label: 'Overdue Acknowledge' },
    { value: 'Overdue Start D3', label: 'Overdue Start D3' }
  ];
  public _mfgs = [];
  public _subMFG = [];
  public _rejectNames = [];
  public _faCodes = [];
  public _ignore: any = {
    startDate: false,
    endDate: false,
    assyCg: false,
    failureCode: false,
    faCode: false,
    mfg: false,
    ncrbNumber: false,
    status: false,
    subMfg: false,
    lotId: false,
    productDescription: false
  };
  constructor(private dropdown: DropdownService, private ajax: AjaxService) {}

  async ngOnInit() {
    try {
      // await this.dropdown.getDropdowns().toPromise();
      const mfg = this.dropdown.getDropdownByGroup('MFG').toPromise();
      const subMFG = this.dropdown.getDropdownByGroup('AREA').toPromise();
      const reject = this.dropdown.getDropdownReject().toPromise();
      const material = this.dropdown.getDropdownMaterial().toPromise();
      const faCode = this.dropdown.getDropdownByGroup('FACODE').toPromise();
      const results = await this.ajax.getPromiseAll([mfg, subMFG, reject, material, faCode]);
      const mfgRes = results[0];
      const subMFGRes = results[1];
      const rejectRes = results[2];
      const materialRes = results[3];
      const faCodeRes = results[4];
      if (mfgRes.status === 200) {
        mfgRes.data.map(obj => {
          if (this._mfgs.findIndex(o => o.label === obj.label) === -1) {
            this._mfgs.push({ id: parseInt(obj.value, 10), label: obj.label, value: obj.value });
          }
          return obj;
        });
        this._mfgs.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }
      if (subMFGRes.status === 200) {
        subMFGRes.data.map(obj => {
          if (this._subMFG.findIndex(o => o.label === obj.label) === -1) {
            this._subMFG.push({ id: parseInt(obj.value, 10), label: obj.label, value: obj.value });
          }
          return obj;
        });
        this._subMFG.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }
      if (rejectRes.status === 200) {
        const data = rejectRes.data.map(obj => {
          return { label: obj.codeName, value: obj.codeName };
        });
        this._rejectNames = data;
      }

      if (faCodeRes.status === 200) {
        const data = faCodeRes.data.map(obj => {
          return { label: obj.label, value: obj.label };
        });
        this._faCodes = data;
      }

      // add material types
      if (materialRes.status === 200) {
        materialRes.data.map(obj => {
          if (this._rejectNames.findIndex(o => o.label === obj.name) === -1) {
            this._rejectNames.push({ label: obj.name, value: obj.name });
          }
          return obj;
        });
        this._rejectNames.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }

      // remove duplicate reject names
      const _rejectNames = this._rejectNames.slice();
      this._rejectNames = [];
      for (let i = 0; i < _rejectNames.length; i++) {
        const idx: number = this._rejectNames.findIndex(o => o.value === _rejectNames[i].value);
        if (idx === -1) {
          this._rejectNames.push(_rejectNames[i]);
        }
      }

      // remove duplicate fa codes
      const _faCodes = this._faCodes.slice();
      this._faCodes = [];
      for (let i = 0; i < _faCodes.length; i++) {
        const idx: number = this._faCodes.findIndex(o => o.value === _faCodes[i].value);
        if (idx === -1) {
          this._faCodes.push(_faCodes[i]);
        }
      }

      // remove fields
      this._ignore = { ...this._ignore, ...this.ignore };
    } catch (ex) {
      // On Crashed
      console.error('NXP Filter Request Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 300);
    }
  }
}
