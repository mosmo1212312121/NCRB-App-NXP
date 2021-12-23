import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { BaseComponent } from '../../../components';
import { ModalDetailComponent } from '../../../components/modal-detail/modal-detail.component';
import { DateConstant } from '../../../constants';
import { Lot, User } from '../../../interfaces';
import { AjaxService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, SwalConfig } from '../../../utils';

@Component({
  selector: 'app-finance-approval',
  templateUrl: './approval.component.html'
})
export class FinanceApprovalComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  dateConstant: DateConstant = new DateConstant();
  user: User = null;
  userSub: any = null;
  lots: FormArray;
  total: number = 0;
  public minDate: Date = null;
  public maxDate: Date = null;
  public loading: boolean = true;
  public submit: boolean = false;
  private bsModalRef: BsModalRef = null;
  private directors: User[] = [];
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
    this.setPageName('finance/approval');

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

  async getData() {
    const ncrbno = this.route.snapshot.paramMap.get('ncrbno');
    const groupName = this.route.snapshot.paramMap.get('group');
    if (ncrbno) {
      // TODO
      try {
        this.loading = true;
        const response = await this.ajax.getLots(ncrbno).toPromise();
        if (response.status === 200) {
          const lots: any[] = response.data.filter(obj => obj.groupName === parseInt(groupName, 10));
          if (lots.length > 0) {
            this.clearFormArray(this.lots);
            for (let i = 0; i < lots.length; i++) {
              this.addLot(
                lots[i].id,
                lots[i].lotId,
                lots[i].cost,
                lots[i].disposition,
                lots[i].quantity,
                lots[i].product12nc
              );
            }

            this.onCostChange();
            if (this.total > 0) {
              this.form.disable();
            }
          }
        }
      } catch (ex) {
        // On Crashed
        console.error('Corrective Action (Prepare data) Errors: ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  public onCostChange() {
    const lots = this.lots.getRawValue();
    let total: number = 0;
    for (let i = 0; i < lots.length; i++) {
      total += parseFloat(lots[i].realCost || '0');
    }

    this.total = total;
  }

  public onSubmit(): void {
    this.submit = true;
    if (this.form.valid) {
      alertConfirm().then(async result => {
        if (result.value) {
          try {
            const response = await this.ajax.getSubmitCosts(this.lots.getRawValue()).toPromise();
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

  public async onDetail() {
    const ncrbno = this.route.snapshot.paramMap.get('ncrbno');
    const res = await this.ajax.getRequestByNumber(ncrbno).toPromise();
    const id = res.data.info.id; // <=== ncrbid here
    this.directors = res.data.info.directors;
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

  public async onApprove() {
    const lots: Lot[] = this.lots.getRawValue();
    const result = await alertConfirm();
    if (result.value) {
      try {
        this.loading = true;
        const response = await this.ajax.getApproveInstruction(lots).toPromise();
        if (response.status === 200) {
          for (let i = 0; i < lots.length; i++) {
            const idx: number = this.lots.getRawValue().findIndex(obj => obj.lotId === lots[i].lotId);
            if (idx > -1) {
              lots[i].groupName = 99;
              lots[i].disposition = response.data.disposition;
              this.lots[idx] = Object.assign({}, this.lots[idx], lots[i], { selected: false });
            }
          }
          this.loading = false;
          const res = await alertSuccess();
          if (res) {
            this.submit = false;
            this.form.disable();
          }
        }
      } catch (ex) {
        console.error('Approve D3 Instruction : ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  public async onReject() {
    const lots: Lot[] = this.lots.getRawValue();
    Swal.fire({
      ...SwalConfig,
      title: 'Reject reason..',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      input: 'text',
      inputPlaceholder: 'Enter your reject reason',
      showCancelButton: true
    }).then(async result => {
      if (result.value) {
        try {
          this.loading = true;
          // Loop to set reject reason
          for (let i = 0; i < lots.length; i++) {
            lots[i].rejectDetail = result.value;
            lots[i].cost = null;
          }
          const response = await this.ajax.getRejectInstruction(lots).toPromise();
          if (response.status === 200) {
            for (let i = 0; i < lots.length; i++) {
              const idx: number = this.lots.getRawValue().findIndex(obj => obj.lotId === lots[i].lotId);
              if (idx > -1) {
                lots[i].disposition = response.data.disposition;
                this.lots.getRawValue()[idx] = Object.assign({}, this.lots.getRawValue()[idx], lots[i], {
                  selected: false
                });
              }
            }
            this.loading = false;
            const res = await alertSuccess('This will redirect to NCRB request page');
            if (res) {
              this.submit = false;
              this.form.disable();
              // Redirect to home page
              const ncrbno = this.route.snapshot.paramMap.get('ncrbno');
              const rs = await this.ajax.getRequestByNumber(ncrbno).toPromise();
              const id = rs.data.info.id; // <=== ncrbid here
              this.router.navigate(['/requests/detail/' + id]);
            }
          }
        } catch (ex) {
          console.error('Reject D3 Instruction : ', ex);
        } finally {
          this.loading = false;
        }
      }
    });
  }

  private addLot(
    id: number,
    lotId: string,
    realCost: number,
    disposition: string,
    quantity: number,
    product12nc: string
  ): void {
    this.lots = this.form.get('lots') as FormArray;
    this.lots.push(
      this.fb.group({
        id: [id],
        lot: [lotId],
        disposition: [disposition],
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

  get isConfirmed() {
    return this.lots && this.lots.getRawValue().filter(object => object.disposition === 'F').length === 0;
  }

  get isDirector() {
    const idx: number = this.directors.length > 0 ? this.directors.findIndex(o => o.empId === this.user.empId) : -1;
    return idx > -1;
  }
}
