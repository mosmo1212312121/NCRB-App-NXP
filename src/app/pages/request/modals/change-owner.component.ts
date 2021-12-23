import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { LogService } from '../../../services';
import { alertConfirm, filterByName } from '../../../utils';

@Component({
  selector: 'app-change-owner',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Change Owner</h5>
      <!-- <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
        <span aria-hidden="true">&times;</span>
      </button> -->
    </div>
    <div class="modal-body" [formGroup]="form">
      <div class="row">
        <div class="col-md-8 mx-auto">
          <div class="row">
            <div class="col-12">
              <nxp-input
                title="Current Owner"
                type="text"
                [parentForm]="form"
                color="bg-success"
                control="currentOwner"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <nxp-users
                title="Owner Selected"
                type="text"
                [parentForm]="form"
                control="owner"
                [submit]="submit"
                (change)="onChange($event)"
              ></nxp-users>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button type="button" class="btn btn-sm btn-primary mx-1" (click)="onSave()">
        <i class="fa fa-save mr-1"></i> Save
      </button>
      <button type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class ChangeOwnerComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  filter = filterByName;
  currentOwner: string = '';
  currentUser: string = '';
  isPemQa: boolean = false;
  public event: EventEmitter<string> = new EventEmitter();
  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder, private logService: LogService) {
    // initial component
    super(logService);
    this.setPageName('change-owner (modal)');

    this.form = this.fb.group({
      owner: [null, Validators.required],
      currentOwner: [{ value: null, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.form.get('currentOwner').patchValue(this.currentOwner);
    // if (this.isPemQa) {
    //   this.form.get('owner').patchValue(this.currentUser);
    //   this.form.get('owner').disable();
    // } else {
    this.form.get('owner').enable();
    // }
    this.form.get('owner').updateValueAndValidity();
  }

  async onSave() {
    this.submit = true;
    if (this.form.valid) {
      if (this.form.getRawValue().owner.split(' ').length === 4) {
        try {
          const result = await alertConfirm('Make sure, your information before submit', 'Are you sure ?');
          if (result.value) {
            const data: string = this.form.getRawValue().owner;
            this.event.emit(data);
            this.bsModalRef.hide();
          }
        } catch (ex) {
          // On Crashed
          console.error('Change Owner Modal (Change Owner) Errors: ', ex);
        }
      } else {
        this.form.get('owner').setErrors(Validators.nullValidator);
        this.form.updateValueAndValidity();
      }
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  onChange(event) {
    const curr: string = this.form.getRawValue().currentOwner;
    if (event) {
      if (event.toString().toUpperCase() === curr.toUpperCase()) {
        this.submit = true;
        this.form.get('owner').setErrors(Validators.nullValidator);
        this.form.updateValueAndValidity();
      } else if (event.toString().toUpperCase() !== curr.toUpperCase() && event.toString().split(' ').length === 4) {
        this.form.get('owner').clearValidators();
        this.form.updateValueAndValidity();
      }
    }
  }
}
