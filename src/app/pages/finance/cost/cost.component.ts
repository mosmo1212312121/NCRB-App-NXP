import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { ModalDetailComponent } from '../../../components/modal-detail/modal-detail.component';
import { DateConstant } from '../../../constants';
import { User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess } from '../../../utils';

@Component({
  selector: 'app-finance-cost',
  templateUrl: './cost.component.html'
})
export class FinanceCostComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  dateConstant: DateConstant = new DateConstant();
  user: User = null;
  userSub: any = null;
  lots: FormArray;
  total: number = 0;
  public formattedTotal: string = '';
  public minDate: Date = null;
  public maxDate: Date = null;
  public loading: boolean = true;
  public submit: boolean = false;
  private bsModalRef: BsModalRef = null;
  private finances: User[] = [];
  constructor(
    private store: Store<IAppState>,
    private route: ActivatedRoute,
    private ajax: AjaxService,
    private fb: FormBuilder,
    private router: Router,
    private currencyPipe: CurrencyPipe,
    private modalService: BsModalService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('finance/costs');

    this.form = this.fb.group({
      ncrbno: [null],
      lots: this.fb.array([])
    });
    this.lots = this.form.get('lots') as FormArray;
    this.userSub = this.store.pipe(select('user')).subscribe(async (user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId'.toUpperCase()) {
        this.user = user;
      } else {
        this.user = null;
      }
      try {
        await this.getData();
      } catch (ex) {
        // On Crashed
        console.error('Calculate costs by finance (Prepare data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  public async onDetail() {
    const ncrbno = this.route.snapshot.paramMap.get('ncrbno');
    const res = await this.ajax.getRequestByNumber(ncrbno).toPromise();
    this.finances = res.data.info.finances;
    const id = res.data.info.id; // <== ncrbid here
    this.bsModalRef = this.modalService.show(ModalDetailComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        id: id
      }
    });
    this.bsModalRef.content.event.subscribe(fullmode => {
      try {
        if (fullmode) {
          this.bsModalRef.hide();
          this.router.navigate(['/requests/detail/' + id]);
        }
      } catch (ex) {
        console.error(ex);
      }
    });
  }

  async getData() {
    const ncrbno = this.route.snapshot.paramMap.get('ncrbno');
    const groupName = this.route.snapshot.paramMap.get('group');
    if (ncrbno) {
      // TODO
      const response = await this.ajax.getLots(ncrbno).toPromise();
      if (response.status === 200) {
        const lots: any[] = response.data.filter(obj => obj.groupName === parseInt(groupName, 10));
        this.clearFormArray(this.lots);
        for (let i = 0; i < lots.length; i++) {
          this.addLot(lots[i].id, lots[i].lotId, lots[i].cost, lots[i].quantity, lots[i].product12nc);
        }

        let total: number = 0;
        for (let i = 0; i < lots.length; i++) {
          total += parseFloat(lots[i].realCost || '0');
        }
        this.total = total;
        if (this.total > 0) {
          this.form.disable();
        }

        if (!this.isFinance) {
          this.form.disable();
        }
      }
      try {
        this.loading = true;
      } catch (ex) {
        // On Crashed
        console.error('Corrective Action (Prepare data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  public onFocus(evt, idx) {
    if (evt) {
      this.lots
        .at(idx)
        .get('cost')
        .patchValue(this.lots.at(idx).get('realCost').value);
    }
  }

  public onBlur(evt, idx) {
    if (evt) {
      this.lots
        .at(idx)
        .get('realCost')
        .patchValue(evt.target.value);
      this.lots
        .at(idx)
        .get('cost')
        .patchValue(this.currencyPipe.transform(evt.target.value, 'USD', '$', '1.4'));
      const lots = this.lots.getRawValue();
      let total: number = 0;
      for (let i = 0; i < lots.length; i++) {
        total += parseFloat(lots[i].realCost || '0');
      }

      this.total = total;
    }
  }

  public onSubmit(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm().then(async result => {
        if (result.value) {
          try {
            const lots = this.lots.getRawValue();
            for (let i = 0; i < lots.length; i++) {
              lots[i].cost = lots[i].realCost;
            }
            const response = await this.ajax.getSubmitCosts(lots).toPromise();
            if (response.status === 200) {
              const res = await alertSuccess();
              if (res) {
                this.submit = false;
                this.form.disable();
              }
            }
          } catch (ex) {
            // error
          }
        }
      });
    }
  }

  private addLot(id: number, lotId: string, realCost: number, quantity: number, product12nc: string): void {
    this.lots = this.form.get('lots') as FormArray;
    this.lots.push(
      this.fb.group({
        id: [id],
        lot: [lotId],
        quantity: [quantity],
        product12nc: [product12nc],
        cost: [realCost ? this.currencyPipe.transform(realCost, 'USD', '$', '4.4') : '', Validators.required],
        realCost: [realCost]
      })
    );
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  get isComplete() {
    return this.total > 0;
  }

  get isNCRBOwner() {
    return this.user?.username === this.form.getRawValue().owner;
  }

  get isFinance() {
    const idx: number = this.finances.length > 0 ? this.finances.findIndex(o => o.empId === this.user.empId) : -1;
    return idx > -1;
  }
}
