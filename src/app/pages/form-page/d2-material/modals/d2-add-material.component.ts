import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../../components';
import { LotMaterial } from '../../../../interfaces';
import { AjaxService, LogService } from '../../../../services';
import { alertConfirm } from '../../../../utils';

@Component({
  selector: 'app-d2-add-material',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">{{ data && data.isWaferFAB ? 'Add Manual' : 'Add Material' }}</h5>
      <!-- <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
        <span aria-hidden="true">&times;</span>
      </button> -->
    </div>
    <div class="modal-body" [formGroup]="form">
      <div class="row">
        <div class="col-xl-11 col-lg-12 mx-auto">
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'Wafer Batch*' : 'Material Type'"
                type="text"
                [parentForm]="form"
                control="materialType"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? '12NC Wafer*' : 'Material 12NC'"
                type="text"
                [parentForm]="form"
                control="material12nc"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'Product Description*' : 'Material Description'"
                type="text"
                [parentForm]="form"
                control="materialDescription"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'BL-Name*' : 'Supplier Lot ID'"
                type="text"
                [parentForm]="form"
                control="supplierLotId"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'Sample Size (ea)*' : 'Lot ID'"
                type="text"
                [parentForm]="form"
                control="lotId"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'Reject Quantity*' : 'Product Description'"
                type="text"
                [parentForm]="form"
                control="productDesc"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'Wafer Slice Quantity*' : 'Reject Quantity'"
                type="number"
                [parentForm]="form"
                control="rejectQty"
                [submit]="submit"
              ></nxp-input>
            </div>
            <div class="col-md-6">
              <nxp-input
                [title]="data && data.isWaferFAB ? 'Machine' : 'On hold Quantity'"
                type="number"
                [parentForm]="form"
                control="onHoldQty"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button id="btnIaActionSubmit" type="button" class="btn btn-sm btn-primary mr-2" (click)="onSave()">
        <i class="fa fa-save mr-1"></i> Save
      </button>
      <button id="btnIaActionCancel" type="button" class="btn btn-sm btn-light" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class D2AddMaterialComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  data: LotMaterial = null;
  submit: boolean = false;
  public event: EventEmitter<LotMaterial> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d2-material (modal)');

    console.log(this.data);
    this.form = this.fb.group({
      selectedMat: [false],
      id: [0],
      seq: 0,
      lotId: '',
      sampleSize: '', // auto
      productDesc: '',
      rejectQty: '',
      problemType: '', // auto
      safeLaunch: '',
      materialType: ['', Validators.required],
      material12nc: ['', Validators.required],
      materialDescription: ['', Validators.required],
      supplier: '', // auto
      invoiceNo: '', // auto
      supplierLotId: ['', Validators.required],
      onHoldQty: '',
      workflow: '', // auto
      currentOpt: '' // auto
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.get('sampleSize').patchValue(this.data.simpleSize);
      this.form.get('problemType').patchValue(this.data.problemType);
      this.form.get('supplier').patchValue(this.data.supplier);
      this.form.get('invoiceNo').patchValue(this.data.invoiceNo);
      this.form.get('sampleSize').patchValue(this.data.simpleSize);
      this.form.get('workflow').patchValue(this.data.workflow);
      this.form.get('currentOpt').patchValue(this.data.currentOpt);
    }
  }

  onSave(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const data = this.form.getRawValue();
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }
}
