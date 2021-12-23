import { AfterViewInit, Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseComponent, NxpSelection } from '../../../components';
import { DropdownService, LogService } from '../../../services';

@Component({
  selector: 'app-enter-result',
  template: `
    <div class="modal-header">
      <h5 class="modal-title pull-left">Result {{ at }}</h5>
    </div>
    <div class="modal-body" [formGroup]="form">
      <div class="row">
        <div class="col-lg-6 col-md-8 mx-auto">
          <div class="row">
            <div class="col-12">
              <nxp-input
                title="Rescreening"
                type="number"
                typeInput="selection"
                placeholder="Select from list"
                [items]="rescreens"
                [parentForm]="form"
                control="rescreen"
                [submit]="submit"
              >
              </nxp-input>
            </div>
            <div class="col-12">
              <nxp-input
                title="Result"
                type="text"
                placeholder="Enter result"
                [parentForm]="form"
                control="result"
                [submit]="submit"
              >
              </nxp-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button type="button" class="btn btn-sm btn-success mx-1" (click)="onSubmit()">
        <i class="fa fa-save mr-1"></i> Submit
      </button>
      <button type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-ban mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class EnterResultComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  data: any = {
    rescreen: 0,
    result: ''
  };
  at: string = '1';
  rescreens: NxpSelection[] = [];
  public event: EventEmitter<string> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private logService: LogService,
    private dropdown: DropdownService
  ) {
    // initial component
    super(logService);
    this.setPageName('enter-name (modal)');

    this.form = this.fb.group({
      result: [null, Validators.required],
      rescreen: [null, Validators.required]
    });
  }

  async ngOnInit() {
    // Declaration
    const rescreens = await this.dropdown.getDropdownByGroup('RESCREEN').toPromise();

    // Using (requesting)
    this.rescreens = rescreens.data.map(o => ({ ...o, ...{ value: parseInt(o.value, 10) } }));

    this.form = this.fb.group({
      result: ['', Validators.required],
      rescreen: [this.data.rescreen, Validators.required]
    });
  }

  async onSubmit() {
    this.submit = true;
    if (this.form.valid) {
      const data: any = this.form.getRawValue();
      this.event.emit(data);
      this.bsModalRef.hide();
    }
  }

  onCancel() {
    this.bsModalRef.hide();
  }
}
