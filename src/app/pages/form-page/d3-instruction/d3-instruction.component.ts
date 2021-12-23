import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { BaseComponent, NxpSelection } from '../../../components';
import { ModalFileComponent } from '../../../components/modal-file/modal-file.component';
import { DateConstant, Status } from '../../../constants';
import { FileObj, Initial, IStatus, Lot, Parameter, ResponseObj, User } from '../../../interfaces';
import {
  AjaxService,
  AuthService,
  BoardGroupService,
  DropdownService,
  LogService,
  MockService
} from '../../../services';
import { AutoActionService } from '../../../services/auto-action.service';
import { setrequest } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess, alertWarning, filterByName, SwalConfig } from '../../../utils';
import { AddInstructionComponent } from './modals/add-instruction';

@Component({
  selector: 'app-d3-instruction',
  templateUrl: 'd3-instruction.component.html'
})
export class D3InstructionComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() ncrbid: number = null;
  @Input() ncrbno: string = '';
  dispositionTypes: NxpSelection[] = [];
  reScreens: NxpSelection[] = [];
  formIn: FormGroup;
  lots: FormArray;
  lotsAppr: FormArray;
  lotsAdded: FormArray;
  lotsBoard: FormArray;
  lotsWait: FormArray;
  lotsWaitDRI: FormArray;
  submit: boolean = false;
  formInSubmit: boolean = false;
  typeName: string = '';
  id: number = null;
  params: Parameter[] = [];
  paramsSub: any = null;
  user: User = null;
  userSub: any = null;
  request: Initial = null;
  requestSub: any = null;
  iStatusSub: any = null;
  status: Status = new Status();
  _status: any = null;
  boardGroups: any[] = [];
  dateConstant: DateConstant = new DateConstant();
  issueByFilter = filterByName;
  ownerFilter = filterByName;
  notFinalAndWafer: boolean = false;
  chkAll: boolean = false;
  updated: boolean = false;

  loading: boolean = false;
  processing: boolean = false;

  problemType: number = -1;
  bsModalRef: BsModalRef;

  public autoDispose: string = 'manual';
  public costs: any = {};
  // false = 'show', true = 'hide'
  public aprInstruction: boolean = false;
  public addInstruction: boolean = false;
  public watBoard: boolean = false;
  public watInstruction: boolean = false;
  public watDRIInstruction: boolean = false;
  public collapse: boolean = false;
  public isAutoDisposeChange: boolean = false;
  routeSub: any;
  constructor(
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private modalService: BsModalService,
    private mock: MockService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dropdown: DropdownService,
    private auth: AuthService,
    private currencyPipe: CurrencyPipe,
    private autoActionService: AutoActionService,
    private boardGroup: BoardGroupService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('d3-instruction');

    this.paramsSub = this.store.pipe(select('parameters')).subscribe((params: Parameter[]) => {
      this.params = params;
    });
    this.formIn = this.fb.group({
      selectedCheck: false
    });
    this.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      if (user && user.empId.trim().toUpperCase() !== 'empId') {
        this.user = user;
      } else {
        this.user = null;
      }
    });
    this.iStatusSub = this.store.pipe(select('status')).subscribe((status: IStatus) => {
      // Hello World
      this._status = status;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe(async (request: Initial) => {
      this.request = request;

      // Form Management
      this.formIn.addControl('lots', this.fb.array([]));
      this.formIn.addControl('lotsAdded', this.fb.array([]));
      this.formIn.addControl('lotsAppr', this.fb.array([]));
      this.formIn.addControl('lotsBoard', this.fb.array([]));
      this.formIn.addControl('lotsWait', this.fb.array([]));
      this.formIn.addControl('lotsWaitDRI', this.fb.array([]));
      this.lots = this.formIn.get('lots') as FormArray;
      this.lotsAdded = this.formIn.get('lotsAdded') as FormArray;
      this.lotsAppr = this.formIn.get('lotsAppr') as FormArray;
      this.lotsBoard = this.formIn.get('lotsBoard') as FormArray;
      this.lotsWait = this.formIn.get('lotsWait') as FormArray;
      this.lotsWaitDRI = this.formIn.get('lotsWaitDRI') as FormArray;
      this.clearFormArray(this.lots);
      this.clearFormArray(this.lotsAdded);
      this.clearFormArray(this.lotsAppr);
      this.clearFormArray(this.lotsBoard);
      this.clearFormArray(this.lotsWait);
      this.clearFormArray(this.lotsWaitDRI);
      this.costs = {};

      // Lots disposition
      this.request.lots.sort(this.sorting);
      const { isD12D8, isD12D83x5Why } = this._status;
      let groupname: number = 0;
      for (let i = 0; i < this.request.lots.length; i++) {
        const {
          dispositionType,
          id,
          lotId,
          rescreen1,
          rescreen2,
          rescreen3,
          attach,
          otherDetail,
          disposition,
          cost,
          productDesc,
          assyCg,
          machine
          // onHoldQty
        } = this.request.lots[i];
        let groupName = this.request.lots[i].groupName;
        // if (id && !onHoldQty) {
        if (id) {
          if (!groupName) {
            groupName = 0;
          }
          if (groupName === 0) {
            if (disposition === 'N') {
              // Lots none instruction
              this.lots.push(
                this.fb.group({
                  id: id,
                  selected: [false],
                  lotId: [{ value: lotId, disabled: true }],
                  dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                  rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                  rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                  rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                  groupName: [{ value: groupName, disabled: true }],
                  productDesc: [{ value: productDesc, disabled: true }],
                  assyCg: [{ value: assyCg, disabled: true }],
                  machine: [{ value: machine, disabled: true }]
                })
              );
            }
          } else {
            if (groupName > 0) {
              const _boardGroupReqs = this.request.boardGroupReqs
                ? this.request.boardGroupReqs.filter(o => o.lotId === lotId)
                : [];
              let isApproveAll: boolean = true;
              if (_boardGroupReqs.length > 0) {
                // Checking if approve all will skip
                for (let k = 0; k < _boardGroupReqs.length; k++) {
                  if (_boardGroupReqs[k].flag !== 'Y') {
                    isApproveAll = false;
                  }
                }
              }

              if ((isD12D8 || isD12D83x5Why) && !isApproveAll) {
                // is QRB or MRB
                if (groupName > groupname) {
                  // Header
                  this.lotsBoard.push(
                    this.fb.group({
                      id: -1,
                      selected: [{ value: false, disabled: true }],
                      lotId: [{ value: lotId, disabled: true }],
                      disposition: [{ value: disposition, disabled: true }],
                      dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                      rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                      rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                      rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                      groupName: [{ value: groupName, disabled: true }],
                      attach: attach,
                      otherDetail: [{ value: otherDetail, disabled: true }]
                    })
                  );
                  // re-assign groupname
                  groupname = groupName;
                }
                // Children
                this.lotsBoard.push(
                  this.fb.group({
                    id: id,
                    selected: [{ value: false, disabled: groupName > 0 }],
                    lotId: [{ value: lotId, disabled: true }],
                    disposition: [{ value: disposition, disabled: true }],
                    dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                    rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                    rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                    rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                    groupName: [{ value: groupName, disabled: true }]
                  })
                );
              } else {
                if (disposition === 'I') {
                  // Lots added instruction
                  // Finding header of Group
                  if (groupName > groupname) {
                    // Header
                    this.lotsAdded.push(
                      this.fb.group({
                        id: -1,
                        selected: [{ value: false, disabled: true }],
                        lotId: [{ value: lotId, disabled: true }],
                        disposition: [{ value: disposition, disabled: true }],
                        dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                        rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                        rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                        rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                        groupName: [{ value: groupName, disabled: true }],
                        attach: attach,
                        otherDetail: [{ value: otherDetail, disabled: true }]
                      })
                    );

                    // re-assign groupname
                    groupname = groupName;
                  }

                  // Children
                  this.lotsAdded.push(
                    this.fb.group({
                      id: id,
                      selected: [{ value: false, disabled: groupName > 0 }],
                      lotId: [{ value: lotId, disabled: true }],
                      disposition: [{ value: disposition, disabled: true }],
                      dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                      rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                      rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                      rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                      groupName: [{ value: groupName, disabled: true }]
                    })
                  );
                }
                if (disposition === 'W') {
                  // Lots waiting for approve instruction
                  // Finding header of Group
                  if (groupName > groupname) {
                    // Header
                    this.lotsAppr.push(
                      this.fb.group({
                        id: -1,
                        selected: [{ value: false, disabled: true }],
                        lotId: [{ value: lotId, disabled: true }],
                        disposition: [{ value: disposition, disabled: true }],
                        dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                        rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                        rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                        rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                        groupName: [{ value: groupName, disabled: true }],
                        attach: attach,
                        otherDetail: [{ value: otherDetail, disabled: true }]
                      })
                    );

                    // re-assign groupname
                    groupname = groupName;
                  }

                  // Children
                  this.lotsAppr.push(
                    this.fb.group({
                      id: id,
                      selected: [{ value: false, disabled: groupName > 0 }],
                      lotId: [{ value: lotId, disabled: true }],
                      disposition: [{ value: disposition, disabled: true }],
                      dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                      rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                      rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                      rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                      groupName: [{ value: groupName, disabled: true }]
                    })
                  );
                }
                if (disposition === 'F' && cost === 0) {
                  // Lots waiting for finance instruction
                  // Finding header of Group
                  if (groupName > groupname) {
                    // Header
                    this.lotsWait.push(
                      this.fb.group({
                        id: -1,
                        selected: [{ value: false, disabled: true }],
                        lotId: [{ value: lotId, disabled: true }],
                        disposition: [{ value: disposition, disabled: true }],
                        dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                        rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                        rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                        rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                        groupName: [{ value: groupName, disabled: true }],
                        attach: attach,
                        otherDetail: [{ value: otherDetail, disabled: true }],
                        cost: [
                          { value: cost ? this.currencyPipe.transform(cost, 'USD', '$', '1.4') : '', disabled: true }
                        ],
                        realCost: [{ value: cost || 0, disabled: true }]
                      })
                    );

                    // re-assign groupname
                    groupname = groupName;
                    this.costs[groupName] = 0;
                  }

                  // Children
                  this.costs[groupName] += cost || 0;
                  this.lotsWait.push(
                    this.fb.group({
                      id: id,
                      selected: [{ value: false, disabled: groupName > 0 }],
                      lotId: [{ value: lotId, disabled: true }],
                      disposition: [{ value: disposition, disabled: true }],
                      dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                      rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                      rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                      rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                      groupName: [{ value: groupName, disabled: true }],
                      cost: [
                        { value: cost ? this.currencyPipe.transform(cost, 'USD', '$', '1.4') : '', disabled: true }
                      ],
                      realCost: [{ value: cost || 0, disabled: true }]
                    })
                  );
                }
                if (disposition === 'F' && cost > 0) {
                  // Lots waiting for director approve instruction
                  // Finding header of Group
                  if (groupName > groupname) {
                    // Header
                    this.lotsWaitDRI.push(
                      this.fb.group({
                        id: -1,
                        selected: [{ value: false, disabled: true }],
                        lotId: [{ value: lotId, disabled: true }],
                        disposition: [{ value: disposition, disabled: true }],
                        dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                        rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                        rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                        rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                        groupName: [{ value: groupName, disabled: true }],
                        attach: attach,
                        otherDetail: [{ value: otherDetail, disabled: true }],
                        cost: [
                          { value: cost ? this.currencyPipe.transform(cost, 'USD', '$', '1.4') : '', disabled: true }
                        ],
                        realCost: [{ value: cost || 0, disabled: true }]
                      })
                    );

                    // re-assign groupname
                    groupname = groupName;
                    this.costs[groupName] = 0;
                  }

                  // Children
                  this.costs[groupName] += cost || 0;
                  this.lotsWaitDRI.push(
                    this.fb.group({
                      id: id,
                      selected: [{ value: false, disabled: groupName > 0 }],
                      lotId: [{ value: lotId, disabled: true }],
                      disposition: [{ value: disposition, disabled: true }],
                      dispositionType: [{ value: dispositionType === 0 ? null : dispositionType, disabled: true }],
                      rescreen1: [{ value: rescreen1 === 0 ? null : rescreen1, disabled: true }],
                      rescreen2: [{ value: rescreen2 === 0 ? null : rescreen2, disabled: true }],
                      rescreen3: [{ value: rescreen3 === 0 ? null : rescreen3, disabled: true }],
                      groupName: [{ value: groupName, disabled: true }],
                      cost: [
                        { value: cost ? this.currencyPipe.transform(cost, 'USD', '$', '1.4') : '', disabled: true }
                      ],
                      realCost: [{ value: cost || 0, disabled: true }]
                    })
                  );
                }
              }
            }
          }
        }
      }

      if (this.request.id !== request.id) {
        this.updated = false;
      }

      if (!this.updated) {
        this.updated = true;
        this.request.isInstruction = this.isInstruction;
        this.store.dispatch(setrequest(Object.assign({}, this.request)));
      }

      // Toggle Checkbox All
      if (this.isSelectedDisabled) {
        this.chkAll = false;
        this.formIn.get('selectedCheck').disable();
      } else {
        this.formIn.get('selectedCheck').enable();
      }

      if (!this.request.isOwner || this.request.isMerged) {
        this.formIn.disable();
      }
    });
  }

  async ngOnInit() {
    const dispositionTypes = this.dropdown.getDropdownByGroup('DISPOSITION').toPromise();
    const reScreens = this.dropdown.getDropdownByGroup('RESCREEN').toPromise();

    this.dispositionTypes = (await dispositionTypes).data;
    this.reScreens = (await reScreens).data;
  }

  ngAfterViewInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.collapse = section.split(',').findIndex(obj => obj.toUpperCase() === 'D3-INSTRUCTION') === -1;
      } else {
        this.collapse = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.userSub.unsubscribe();
    this.requestSub.unsubscribe();
    this.iStatusSub.unsubscribe();
    this.auth.disconnect();
  }

  sorting(a, b) {
    if (a.groupName < b.groupName) {
      return -1;
    }
    if (a.groupName > b.groupName) {
      return 1;
    }
    return 0;
  }

  public onAddInstruction(): void {
    this.bsModalRef = this.modalService.show(AddInstructionComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        data: {
          ncrbid: this.request.id,
          groupName: this.latestGroup(),
          lots: this.lots.getRawValue().filter(obj => obj.selected)
        }
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      await this.onAddNewInstruction(data);
    });
  }

  public async onAddNewInstruction(data) {
    try {
      this.loading = true;
      const lots = data.lots;
      for (let i = 0; i < lots.length; i++) {
        const idx: number = this.request.lots.findIndex(obj => obj.lotId === lots[i].lotId);
        if (idx > -1) {
          /**
           * if dispositionType = 'scrap' return 'F'
           * else if retest = true return 'R'
           * else return 'I'
           */
          lots[i].disposition =
            lots[i].dispositionType === 1 ? 'Z' : lots[i].dispositionType === 2 ? 'F' : data.retest ? 'R' : 'I';

          this.request.lots[idx] = Object.assign({}, this.request.lots[idx], lots[i], { selected: false });
          this.chkAll = false;
          this.lots
            .at(i)
            .get('selected')
            .disable();
          this.formIn.get('selectedCheck').patchValue(false);
        }
      }
      const response: ResponseObj = await this.ajax
        .saveInstruction(this.request.ncnumber, data.retest, this.request.rejectName, lots)
        .toPromise();
      if (response.status === 200) {
        for (let i = 0; i < lots.length; i++) {
          const idx: number = this.request.lots.findIndex(obj => obj.lotId === lots[i].lotId);
          if (idx > -1) {
            // Creating group for board approval
            if (this._status.isD12D8 || this._status.isD12D83x5Why) {
              const boardGroups = [];
              for (let j = 0; j < this.request.boardGroups.length; j++) {
                const { groupId, needDevice, needQrb, needMrb } = this.request.boardGroups[j];
                const ncrbId = this.request.id;
                boardGroups.push(
                  this.boardGroup
                    .createBoardLotInstruction(groupId, ncrbId, lots[i].lotId, needDevice, needQrb, needMrb)
                    .toPromise()
                );
              }
              await Promise.all(boardGroups);
            }

            lots[i].disposition = response.data.disposition;
            this.request.lots[idx] = Object.assign({}, this.request.lots[idx], lots[i], { selected: false });
            this.chkAll = false;
            this.lots
              .at(i)
              .get('selected')
              .disable();
            this.formIn.get('selectedCheck').patchValue(false);
          }
        }
        this.request.isInstruction = this.isInstruction;
        this.request.boardGroupReqs = (await this.boardGroup.getBoardLotInstructions(this.request.id).toPromise()).data;
        this.store.dispatch(setrequest(Object.assign({}, this.request)));
        alertSuccess();
      }
    } catch (ex) {
      console.error('D3 Instruction saving : ', ex);
    } finally {
      this.loading = false;
    }
  }

  public async onApprove(groupName: string, lotsName: string = 'Appr') {
    const lots: Lot[] = this[`lots${lotsName}`]
      .getRawValue()
      .filter(obj => parseInt(obj.groupName, 10) === parseInt(groupName, 10) && obj.id > -1);
    const result = await alertConfirm();
    if (result.value) {
      try {
        this.loading = true;
        const response = await this.ajax.getApproveInstruction(lots).toPromise();
        if (response.status === 200) {
          for (let i = 0; i < lots.length; i++) {
            const idx: number = this.request.lots.findIndex(obj => obj.lotId === lots[i].lotId);
            if (idx > -1) {
              lots[i].disposition = response.data.disposition;
              this.request.lots[idx] = Object.assign({}, this.request.lots[idx], lots[i], { selected: false });
            }
          }
          this.store.dispatch(setrequest(Object.assign({}, this.request)));
        }
      } catch (ex) {
        console.error('Approve D3 Instruction : ', ex);
      } finally {
        this.loading = false;
      }
    }
  }

  public async onReject(groupName: string) {
    const lots: Lot[] = this.lotsAppr
      .getRawValue()
      .filter(obj => parseInt(obj.groupName, 10) === parseInt(groupName, 10) && obj.id > -1);
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
          }
          const response = await this.ajax.getRejectInstruction(lots).toPromise();
          if (response.status === 200) {
            for (let i = 0; i < lots.length; i++) {
              const idx: number = this.request.lots.findIndex(obj => obj.lotId === lots[i].lotId);
              if (idx > -1) {
                lots[i].disposition = response.data.disposition;
                this.request.lots[idx] = Object.assign({}, this.request.lots[idx], lots[i], { selected: false });
              }
            }
            this.store.dispatch(setrequest(Object.assign({}, this.request)));
          }
        } catch (ex) {
          console.error('Reject D3 Instruction : ', ex);
        } finally {
          this.loading = false;
        }
      }
    });
  }

  public onChk(): void {
    let chkAll: boolean = true;
    for (let i = 0; i < this.lots.length; i++) {
      if (this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
        if (!this.lots.at(i).get('selected').value) {
          chkAll = false;
        }
      }
    }

    this.chkAll = chkAll;
    this.formIn.get('selectedCheck').patchValue(chkAll);
  }

  public onToggleChk(): void {
    this.chkAll = !this.chkAll;
    this.formIn.get('selectedCheck').patchValue(this.chkAll);
    for (let i = 0; i < this.lots.length; i++) {
      if (this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
        this.request.lots[i].selected = this.chkAll;
        this.lots.at(i).patchValue({ selected: this.chkAll });
      }
    }
  }

  async downloadFile(idx: number) {
    const attachFile: FileObj = this.lotsAdded.getRawValue()[idx].attach;
    this.bsModalRef = this.modalService.show(ModalFileComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        title: 'D3 File View NCRB',
        folders: [this.request.id.toString(), 'D3'],
        fileid: attachFile.id,
        filename: attachFile.fileName,
        filenames: attachFile.fileName?.split('.').join(',') || 'Not Found,html'
      }
    });
    this.bsModalRef.content.event.subscribe(async (data: any) => {
      try {
        this.loading = true;
      } catch (ex) {
        console.error('Download File : ', ex);
      } finally {
        this.loading = false;
      }
    });
  }

  public rescreen(res: string): string {
    return this.reScreens.find(obj => parseInt(obj.value, 10) === parseInt(res, 10))?.label || 'NONE';
  }

  public onAutoDisposeChange(evt) {
    this.isAutoDisposeChange = true;
  }

  public async onBoardApprove(lotId: string, groupId: number) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        this.loading = true;
        const ncrbId: number = this.request.id;
        const approver: string = this.user.name;
        const response = await this.boardGroup.approveBoardLotInstruction(ncrbId, groupId, lotId, approver).toPromise();
        if (response.data) {
          await alertSuccess();
          window.location.reload();
        }
      }
    } catch (err) {
      console.log('onBoardApprove Error: ', err);
    } finally {
      this.loading = false;
    }
  }

  public async onBoardReject(lotId: string) {
    try {
      const result = await alertConfirm();
      if (result.value) {
        this.loading = true;
        const ncrbId: number = this.request.id;
        const approver: string = this.user.name;
        const response = await this.boardGroup.rejectBoardLotInstruction(ncrbId, lotId, approver).toPromise();
        if (response.data) {
          await alertSuccess();
          window.location.reload();
        }
      }
    } catch (err) {
      console.log('onBoardReject Error: ', err);
    } finally {
      this.loading = false;
    }
  }

  public async onSelectDisposition() {
    try {
      if ('AUTO' === this.autoDispose.toUpperCase()) {
        const result = await alertConfirm();
        if (result.value) {
          // Select New Lots
          if (this.chkAll) {
            this.onToggleChk();
            this.onToggleChk();
          } else {
            this.onToggleChk();
          }
          // Get Auto Disposition
          const response = await this.autoActionService.getAutoDispositionByNC(this.ncrbno).toPromise();
          if (response.status === 200) {
            console.log('Selected: ', this.autoDispose);
            console.log('Response: ', response.data);
            if (response.data.dispositionType > 0) {
              const data = {
                retest: false,
                lots: []
              };
              const { rescreen1, rescreen2, rescreen3, dispositionType } = response.data;
              const groupName: number = this.latestGroup();
              if (
                this.dropdown.isRetest(rescreen1) ||
                this.dropdown.isRetest(rescreen2) ||
                this.dropdown.isRetest(rescreen3)
              ) {
                data.retest = true;
              }
              for (let i = 0; i < this.lots.length; i++) {
                const lot = (this.lots.at(i) as FormGroup).getRawValue();
                data.lots.push({
                  ...lot,
                  ...{
                    attach: {
                      id: null,
                      formName: '',
                      fileName: '',
                      ncrbid: null,
                      file: null
                    },
                    dispositionType,
                    groupName,
                    otherDetail: '',
                    rescreen1,
                    rescreen2,
                    rescreen3,
                    selected: false
                  }
                });
              }
              this.onAddNewInstruction(data);
            } else {
              await alertWarning('Sorry, auto disposition is not configuration. Please manual by yourself');
            }
          }
        }
      }
    } catch (ex) {
      console.error('Error: ', ex);
    } finally {
      // Do Something
      this.isAutoDisposeChange = false;
    }
  }

  public getBoardGroupReqs(lotId: string): any[] {
    return this.request.boardGroupReqs ? this.request.boardGroupReqs.filter(o => o.lotId === lotId) : [];
  }

  public approvable(groupReqId: number, lotId: string): boolean {
    const boardGroupReq = this.request.boardGroupReqs.find(o => o.groupReqId === groupReqId && o.lotId === lotId);
    if (boardGroupReq) {
      if (this.user) {
        const idx: number = boardGroupReq.members.findIndex(m => m.memberWBI === this.user.username);
        return idx > -1;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  private latestGroup(): number {
    let groupName: number = 0;
    const lots: any[] = this.request.lots;
    for (let i = 0; i < lots.length; i++) {
      if (lots[i].groupName > groupName) {
        groupName = lots[i].groupName;
      }
    }
    return groupName + 1;
  }

  get isSelectedDisabled(): boolean {
    let disabled: boolean = true;
    if (this.lots) {
      for (let i = 0; i < this.lots.length; i++) {
        if (this.lots.at(i) && !this.lots.at(i).get('selected').disabled) {
          disabled = false;
        }
      }
    }
    return (this.lots && this.lots.length === 0) || disabled;
  }

  get countSelected(): number {
    return this.lots.getRawValue().filter(obj => obj.selected === true).length;
  }

  get countAddedInstruction(): number {
    return this.lotsAdded.getRawValue().filter(obj => obj.id > -1).length;
  }

  get countApprInstruction(): number {
    return this.lotsAppr.getRawValue().filter(obj => obj.id > -1).length;
  }

  get countWaitInstruction(): number {
    return this.lotsWait.getRawValue().filter(obj => obj.id > -1).length;
  }

  get countWaitBoard(): number {
    return this.lotsBoard.getRawValue().filter(obj => obj.id > -1).length;
  }

  get countWaitDRIInstruction(): number {
    return this.lotsWaitDRI.getRawValue().filter(obj => obj.id > -1).length;
  }

  get isInstruction(): boolean {
    let fact: boolean = true;
    for (let i = 0; i < this.request.lots.length; i++) {
      switch (this.request.lots[i].disposition) {
        case 'N': // New lot need to instruction
          fact = false;
          break;
        case 'I': //
          fact = false;
          break;
        case 'W':
          fact = false;
          break;
        case 'F': // Scrap lot need to fill scrap value or director approve
          console.log(this.request.lots[i].disposition);
          fact = false;
          break;
      }
    }
    return this.request.lots.length > 0 && fact;
  }

  get isMte(): boolean {
    return (
      (this.request.mteEngineers?.length > 0 &&
        this.user?.empId !== 'empId' &&
        this.request.mteEngineers.findIndex(obj => obj.empId === this.user.empId) > -1) ||
      (this.request.mteManagers?.length > 0 &&
        this.user?.empId !== 'empId' &&
        this.request.mteManagers.findIndex(obj => obj.empId === this.user.empId) > -1)
    );
  }

  get isHaveLotsUnInstruction(): boolean {
    return this.request.lots.length > 0;
  }

  get title(): string {
    return this.params.length > 0 ? this.params.find(o => o.label === 'TITLE_D3_4').value : 'Loading';
  }

  get isWaferFAB(): boolean {
    return (this.request.isPreviousProcess || this.request.isInProcess) && this.request.mfg.toString() === '816';
  }
}
