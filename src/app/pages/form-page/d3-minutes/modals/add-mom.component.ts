import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../../components';
import { FileObj, Minute, ResponseObj } from '../../../../interfaces';
import { AjaxService, LogService } from '../../../../services';
import { alertConfirm, alertWarning, filterByName } from '../../../../utils';

@Component({
  selector: 'app-add-mom',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Add Minute</h5>
      <!-- <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
<span aria-hidden="true">&times;</span>
</button> -->
    </div>
    <div class="modal-body" [formGroup]="form">
      <div class="row">
        <div class="col-xl-7 col-lg-9 col-12 mx-auto">
          <div class="row">
            <div class="col-md-12">
              <nxp-input
                title="Meeting Date"
                type="date"
                [parentForm]="form"
                control="meetingDate"
                [minDate]="minDate"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <div class="form row">
                <div class="col-md-4">
                  <label class="col-form-label mb-0">Minute Note</label>
                </div>
                <div class="col-md-12">
                  <textarea
                    id="minuteNote"
                    formControlName="minuteNote"
                    class="form-control"
                    [ngClass]="{
                      'is-invalid': form.get('minuteNote').invalid && submit
                    }"
                    rows="3"
                    [ngStyle]="{ 'font-weight': '500' }"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 pt-3">
              <div class="form-group row">
                <label class="col-md-4 col-label">Attach file</label>
                <div class="col-md-8">
                  <div class="custom-file">
                    <input
                      type="file"
                      class="custom-file-input"
                      (change)="selectFile($event, 'form', 'minuteFile')"
                      id="minuteFile"
                    />
                    <label class="custom-file-label" for="minuteFile">{{
                      form.get('minuteFile').get('fileName').value || 'Choose file'
                    }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- File -->
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button id="btnMomUpdate" type="button" class="btn btn-sm btn-primary mr-2" *ngIf="data" (click)="onSave()">
        <i class="fa fa-check-circle mr-1"></i> Update
      </button>
      <button id="btnMomSave" type="button" class="btn btn-sm btn-primary mr-2" *ngIf="!data" (click)="onSave()">
        <i class="fa fa-save mr-1"></i> Save
      </button>
      <button id="btnCancel" type="button" class="btn btn-sm btn-light" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class D3AddMomComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  data: Minute = null;
  ncrbid: number = 0;
  filter = filterByName;
  public minDate: Date = new Date();
  public event: EventEmitter<Minute> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-add-minutes (modal)');

    this.form = this.fb.group({
      id: [0],
      ncrbno: [{ value: '', disabled: true }, Validators.required],
      meetingDate: [new Date(), Validators.required],
      minuteNote: [null, Validators.required],
      minuteFile: this.fb.group({
        id: null,
        formName: '',
        fileName: '',
        ncrbid: null,
        file: null
      }),
      userName: [null],
      name: [null]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
      this.form.get('ncrbno').patchValue(this.data.ncrbNo);
    }
  }

  onSave(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const data = this.form.getRawValue();
          data.status = 'NEW'; // Default : NEW
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  async selectFile(event, form: string, control: string) {
    try {
      if (this[form].get(control).value) {
        const fileObj: FileObj = this[form].get(control).value;
        let response: ResponseObj = await this.ajax
          .removeFiles(fileObj.id, fileObj.ncrbid, fileObj.formName, fileObj.fileName)
          .toPromise();
        if (event.target.files[0]) {
          if (this.lessThanLimit(event.target.files[0].size)) {
            const formData = new FormData();
            formData.append('file', event.target.files[0], `${this.ncrbid}/MOM/${event.target.files[0].name}`);
            response = await this.ajax.uploadFile(formData).toPromise();
            this[form].get(control).patchValue(response.data);
          } else {
            alertWarning('Please upload file less than 10 MB');
          }
        }
      } else {
        if (event.target.files[0]) {
          if (this.lessThanLimit(event.target.files[0].size)) {
            const formData = new FormData();
            formData.append('file', event.target.files[0], `${this.ncrbid}/MOM/${event.target.files[0].name}`);
            const response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
            this[form].get(control).patchValue(response.data);
          } else {
            alertWarning('Please upload file less than 10 MB');
          }
        }
      }
    } catch (ex) {
      console.error('Add MOM (Upload file) Errors: ', ex);
    }
  }

  private getSize(sizeinbytes: number): string {
    const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
    let fSize = sizeinbytes;
    let i = 0;
    while (fSize > 900) {
      fSize /= 1024;
      i++;
    }
    return Math.round(fSize * 100) / 100 + ' ' + fSExt[i];
  }
  private lessThanLimit(sizeinbytes: number): boolean {
    const size: string = this.getSize(sizeinbytes);
    if ((size.split(' ')[1] === 'MB' && parseInt(size.split(' ')[0], 10) <= 9.99) || size.split(' ')[1] === 'KB') {
      return true;
    }
    return false;
  }
}
