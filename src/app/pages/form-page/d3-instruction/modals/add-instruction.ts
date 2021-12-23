import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../../components';
import { FileObj, ResponseObj } from '../../../../interfaces';
import { AjaxService, DropdownService, LogService } from '../../../../services';
import { alertConfirm, alertWarning, filterByName } from '../../../../utils';

@Component({
  selector: 'app-add-action',
  templateUrl: 'add-instruction.html'
})
export class AddInstructionComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  data: any = null;
  submit: boolean = false;
  filter = filterByName;
  lots: FormArray;
  public loading: boolean = false;
  public dispositions: NxpSelection[] = [];
  public rescreens: NxpSelection[] = [];
  public minDate: Date = moment().toDate();
  public event: EventEmitter<any> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private dropdown: DropdownService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-add-instruction (modal)');

    this.form = this.fb.group({
      disposition: ['', Validators.required],
      rescreen1: ['', Validators.required],
      rescreen2: [''],
      rescreen3: [''],
      otherDetail: [null],
      attach: this.fb.group({
        id: null,
        formName: '',
        fileName: '',
        ncrbid: null,
        file: null
      }),
      groupName: [null, Validators.required],
      retest: [false],
      lots: this.fb.array([])
    });
    this.lots = this.form.get('lots') as FormArray;
  }

  async ngOnInit() {
    // Declaration
    const dispositions = this.dropdown.getDropdownByGroup('DISPOSITION').toPromise();
    const rescreens = this.dropdown.getDropdownByGroup('RESCREEN').toPromise();

    // Using (requesting)
    this.dispositions = (await dispositions).data;
    this.rescreens = (await rescreens).data;

    if (this.data) {
      this.lots = this.form.get('lots') as FormArray;
      for (let i = 0; i < this.data.lots.length; i++) {
        this.lots.push(
          this.fb.group(
            Object.assign({}, this.data.lots[i], { lotId: [{ value: this.data.lots[i].lotId, disabled: true }] })
          )
        );
      }
      this.form.patchValue({
        groupName: this.data.groupName
      });
    }
  }

  onSave(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const { rescreen1, rescreen2, rescreen3 } = this.form.getRawValue();
          if (
            this.dropdown.isRetest(rescreen1) &&
            this.dropdown.isRetest(rescreen2) &&
            this.dropdown.isRetest(rescreen3)
          ) {
            this.form.get('retest').patchValue(true);
          }
          const data = this.form.getRawValue();
          for (let i = 0; i < data.lots.length; i++) {
            data.lots[i].attach = data.attach;
            data.lots[i].dispositionType = data.disposition;
            data.lots[i].groupName = data.groupName;
            data.lots[i].otherDetail = data.otherDetail;
            data.lots[i].rescreen1 = data.rescreen1;
            data.lots[i].rescreen2 = data.rescreen2;
            data.lots[i].rescreen3 = data.rescreen3;
          }

          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  async onCancel() {
    try {
      if (this.form.getRawValue().attach.id > 0) {
        this.loading = true;
        const fileObj: FileObj = this.form.get('attach').value;
        await this.ajax.removeFiles(fileObj.id, fileObj.ncrbid, fileObj.formName, fileObj.fileName).toPromise();
      }
    } catch (ex) {
      console.error('modal onCancel : ', ex);
    } finally {
      this.loading = false;
      this.bsModalRef.hide();
    }
  }

  async selectFile(event, form: string, control: string) {
    this.loading = true;
    try {
      if (this[form].get(control).value) {
        const fileObj: FileObj = this[form].get(control).value;
        let response: ResponseObj = await this.ajax
          .removeFiles(fileObj.id, fileObj.ncrbid, fileObj.formName, fileObj.fileName)
          .toPromise();
        if (event.target.files[0]) {
          if (this.lessThanLimit(event.target.files[0].size)) {
            const formData = new FormData();
            formData.append('file', event.target.files[0], `${this.data.ncrbid}/D3INS/${event.target.files[0].name}`);
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
            formData.append('file', event.target.files[0], `${this.data.ncrbid}/D3INS/${event.target.files[0].name}`);
            const response: ResponseObj = await this.ajax.uploadFile(formData).toPromise();
            this[form].get(control).patchValue(response.data);
          } else {
            alertWarning('Please upload file less than 10 MB');
          }
        }
      }
    } catch (ex) {
      console.error('Add MOM (Upload file) Errors: ', ex);
    } finally {
      this.loading = false;
    }
  }

  onDispositionChange(event) {
    if (typeof event === 'string') {
      console.log('Disposition ', event);
      switch (event) {
        case '1':
          this.form.get('rescreen1').clearValidators();
          this.form.get('rescreen1').updateValueAndValidity();
          break;
        case '2':
          this.form.get('rescreen1').clearValidators();
          this.form.get('rescreen1').updateValueAndValidity();
          break;
        case '3':
          this.form.get('rescreen1').setValidators([Validators.required]);
          this.form.get('rescreen1').updateValueAndValidity();
          break;
      }
    }
  }

  onChangeRescreen1(event) {
    if (typeof event === 'string') {
      console.log('Rescreen 1', event);
      const { rescreen2, rescreen3 } = this.form.getRawValue();
      if (event === '8' || rescreen2 === '8' || rescreen3 === '8') {
        this.form
          .get('attach')
          .get('id')
          .setValidators([Validators.required]);
      } else {
        this.form
          .get('attach')
          .get('id')
          .clearValidators();
      }
      this.form
        .get('attach')
        .get('id')
        .updateValueAndValidity();
    }
  }

  onChangeRescreen2(event) {
    if (typeof event === 'string') {
      console.log('Rescreen 2', event);
      const { rescreen1, rescreen3 } = this.form.getRawValue();
      if (event === '8' || rescreen1 === '8' || rescreen3 === '8') {
        this.form
          .get('attach')
          .get('id')
          .setValidators([Validators.required]);
      } else {
        this.form
          .get('attach')
          .get('id')
          .clearValidators();
      }
      this.form.get('attach').updateValueAndValidity();
    }
  }

  onChangeRescreen3(event) {
    if (typeof event === 'string') {
      console.log('Rescreen 3', event);
      const { rescreen1, rescreen2 } = this.form.getRawValue();
      if (event === '8' || rescreen1 === '8' || rescreen2 === '8') {
        this.form
          .get('attach')
          .get('id')
          .setValidators([Validators.required]);
      } else {
        this.form
          .get('attach')
          .get('id')
          .clearValidators();
      }
      this.form
        .get('attach')
        .get('id')
        .updateValueAndValidity();
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
    if (
      (size.split(' ')[1] === 'MB' && parseInt(size.split(' ')[0], 10) <= 9.99) ||
      size.split(' ')[1] === 'KB' ||
      size.split(' ')[1] === 'Bytes'
    ) {
      return true;
    }
    return false;
  }
}
