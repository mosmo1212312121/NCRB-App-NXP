import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NxpSelection } from '../../../components';
import { DropdownService } from '../../../services';
import { RejectNameService } from '../../../services/reject-name.service';
import { alertConfirm } from '../../../utils';

@Component({
  selector: 'app-reject-criteria-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Reject Name Editor</h5>
    </div>
    <div class="modal-body">
      <div class="row" [formGroup]="form">
        <div class="col-md-10 mx-auto">
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                title="Code"
                type="text"
                [parentForm]="form"
                [submit]="submit"
                [parentForm]="form"
                [submit]="submit"
                control="code"
                maxlength="100"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                title="Name"
                type="text"
                [parentForm]="form"
                [submit]="submit"
                [parentForm]="form"
                [submit]="submit"
                control="name"
                maxlength="100"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                title="FA Code"
                type="number"
                typeInput="selection"
                placeholder="Please select fa code"
                [items]="faCodes"
                [parentForm]="form"
                control="faCode"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                title="Category"
                type="number"
                typeInput="selection"
                placeholder="Please select category"
                [items]="categories"
                [parentForm]="form"
                control="category"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                title="Spec"
                type="text"
                [parentForm]="form"
                [submit]="submit"
                [parentForm]="form"
                [submit]="submit"
                control="spec"
                maxlength="100"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                title="Level"
                type="number"
                [parentForm]="form"
                [submit]="submit"
                [parentForm]="form"
                [submit]="submit"
                control="levelVal"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                title="MFG"
                type="text"
                typeInput="selection"
                placeholder="Please select mfg"
                [items]="mfgs"
                [parentForm]="form"
                control="mfg"
                (change)="onMfgChange($event)"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                title="Sub MFG"
                type="text"
                typeInput="selection"
                placeholder="Please select sub mfg"
                [items]="subMfgs"
                [parentForm]="form"
                control="subMfg"
                (change)="onChange($event)"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                title="Hold Code"
                type="text"
                typeInput="selection"
                placeholder="Please select hold code"
                [items]="holdCodes"
                [parentForm]="form"
                control="holdCode"
                (change)="onChange($event)"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6 d-none">
              <nxp-input
                title="Hold Comment"
                type="text"
                [parentForm]="form"
                [submit]="submit"
                [parentForm]="form"
                [submit]="submit"
                control="holdComment"
                maxlength="100"
                (change)="onChange($event)"
              ></nxp-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button type="button" class="btn btn-sm btn-primary mx-1" (click)="onSubmit()">
        <i class="fa fa-save mr-1"></i> Submit
      </button>
      <button (click)="onReset()" class="btn btn-sm btn-danger mx-1"><i class="fa fa-refresh mr-1"></i>Reset</button>
      <button type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class RejectCriteriaModalComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  data: any = null;
  categories: NxpSelection[] = [];
  faCodes: NxpSelection[] = [];
  holdCodes: NxpSelection[] = [];
  mfgs: NxpSelection[] = [];
  subMfgs: NxpSelection[] = [];
  public event: EventEmitter<any> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private rejectService: RejectNameService,
    private dropdown: DropdownService
  ) {
    this.form = this.fb.group({
      rid: [0],
      code: ['', Validators.required],
      name: ['', Validators.required],
      category: ['', Validators.required],
      spec: ['', Validators.required],
      levelVal: ['', Validators.required],
      faCode: ['', Validators.required],
      holdCode: ['', Validators.required],
      holdComment: ['-'],
      mfg: ['', Validators.required],
      subMfg: ['', Validators.required],
      deletable: []
    });
  }

  ngOnInit(): void {
    if (this.data) {
      const {
        rid,
        code,
        name,
        category,
        spec,
        levelVal,
        faCode,
        holdCode,
        holdComment,
        deletable,
        mfg,
        subMfg
      } = this.data;
      this.form = this.fb.group({
        rid: [rid],
        code: [code, Validators.required],
        name: [name, Validators.required],
        category: [category, Validators.required],
        spec: [spec, Validators.required],
        levelVal: [levelVal, Validators.required],
        faCode: [faCode, Validators.required],
        holdCode: [holdCode, Validators.required],
        holdComment: [holdComment, Validators.required],
        mfg: [mfg, Validators.required],
        subMfg: ['', Validators.required],
        deletable: [deletable]
      });
      this.onMfgChange(null).then(() => {
        setTimeout(() => {
          this.form.get('subMfg').patchValue(subMfg);
          this.form.get('subMfg').updateValueAndValidity();
        }, 300);
      });
    }
  }

  public async onSubmit() {
    // validate
    this.submit = true;

    if (this.form.valid) {
      const result = await alertConfirm();
      if (result.value) {
        const values = this.form.getRawValue();
        this.submit = false;
        this.event.emit(values);
        this.bsModalRef.hide();
      }
    }
  }

  public async onReset() {
    const result = await alertConfirm();
    if (result.value) {
      this.form.patchValue(this.data);
    }
  }

  public async onCancel() {
    this.bsModalRef.hide();
  }

  public onChange(evt) {
    // Do Something
  }

  public async onMfgChange(evt) {
    // Do Something
    try {
      const { mfg } = this.form.getRawValue();
      const idx: number = this.mfgs.findIndex(o => o.value.toString() === mfg.toString());
      if (idx > -1) {
        const response = await this.dropdown.getDropdownByParent(this.mfgs[idx].id.toString()).toPromise();
        this.subMfgs = response.data;
      }
    } catch (err) {
      console.log('Error: ', err);
      this.subMfgs = [];
    } finally {
    }
  }
}
