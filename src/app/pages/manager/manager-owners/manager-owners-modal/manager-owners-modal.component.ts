import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SweetAlertResult } from 'sweetalert2';
import { BaseComponent, NxpSelection } from '../../../../components';
import { User } from '../../../../interfaces';
import { AjaxService, LogService } from '../../../../services';
import { alertConfirm, filterByName } from '../../../../utils';

@Component({
  selector: 'app-manager-owners-modal',
  templateUrl: 'manager-owners-modal.component.html'
})
export class ManagerOwnersModalComponent extends BaseComponent implements OnInit {
  title: string = 'Edit Owners';
  form: FormGroup;
  data: any = null;
  copy: any = null;
  submit: boolean = false;
  filter = filterByName;
  d3Owner: FormArray;
  d3OwnerRemove: any[] = [];
  d4d8Owner: FormArray;
  d4d8OwnerRemove: any[] = [];
  fuqa: FormArray;
  fuqaRemove: any[] = [];
  pemqa: FormArray;
  pemqaRemove: any[] = [];
  mteEngineers: FormArray;
  mteEngineersRemove: any[] = [];
  mteManagers: FormArray;
  mteManagersRemove: any[] = [];
  directors: FormArray;
  directorsRemove: any[] = [];
  finances: FormArray;
  financesRemove: any[] = [];
  materialOwners: FormArray;
  materialOwnersRemove: any[] = [];
  teamMember: FormArray;
  teamMemberRemove: any[] = [];
  fabMember: FormArray;
  fabMemberRemove: any[] = [];
  public event: EventEmitter<NxpSelection> = new EventEmitter();
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/owners-management (modal)');

    this.form = this.fb.group({
      mfg: [],
      subMfg: [],
      problemProcess: [],
      problemProcessId: [],
      d3Owner: this.fb.array([]),
      d4d8Owner: this.fb.array([]),
      fuqa: this.fb.array([]),
      pemqa: this.fb.array([]),
      mteEngineers: this.fb.array([]),
      mteManagers: this.fb.array([]),
      directors: this.fb.array([]),
      finances: this.fb.array([]),
      materialOwners: this.fb.array([]),
      teamMember: this.fb.array([]),
      fabMember: this.fb.array([])
    });
    this.d3Owner = this.form.get('d3Owner') as FormArray;
    this.d4d8Owner = this.form.get('d4d8Owner') as FormArray;
    this.fuqa = this.form.get('fuqa') as FormArray;
    this.pemqa = this.form.get('pemqa') as FormArray;
    this.mteEngineers = this.form.get('mteEngineers') as FormArray;
    this.mteManagers = this.form.get('mteManagers') as FormArray;
    this.directors = this.form.get('directors') as FormArray;
    this.finances = this.form.get('finances') as FormArray;
    this.materialOwners = this.form.get('materialOwners') as FormArray;
    this.teamMember = this.form.get('teamMember') as FormArray;
    this.fabMember = this.form.get('fabMember') as FormArray;
  }

  ngOnInit(): void {
    if (this.data) {
      this.form = this.fb.group({
        mfg: [{ value: this.data.mfg, disabled: true }],
        subMfg: [{ value: this.data.subMfg, disabled: true }],
        problemProcess: [{ value: this.data.problemProcess, disabled: true }],
        problemProcessId: [{ value: this.data.problemProcessId, disabled: true }],
        d3Owner: this.fb.array([]),
        d4d8Owner: this.fb.array([]),
        fuqa: this.fb.array([]),
        pemqa: this.fb.array([]),
        mteEngineers: this.fb.array([]),
        mteManagers: this.fb.array([]),
        directors: this.fb.array([]),
        finances: this.fb.array([]),
        materialOwners: this.fb.array([]),
        teamMember: this.fb.array([]),
        fabMember: this.fb.array([])
      });
      this.d3Owner = this.form.get('d3Owner') as FormArray;
      for (let i = 0; i < this.data.d3Owner.length; i++) {
        this.d3Owner.push(
          this.fb.group({
            seq: [this.data.d3Owner[i].seq, Validators.required],
            id: this.data.d3Owner[i].id,
            wbi: this.data.d3Owner[i].wbi,
            email: [this.data.d3Owner[i].email, Validators.required],
            role: [this.data.d3Owner[i].role, Validators.required],
            createDate: this.data.d3Owner[i].createDate,
            name: [{ value: this.data.d3Owner[i].name, disabled: true }, Validators.required],
            empId: this.data.d3Owner[i].empId,
            problemProcessId: [this.data.d3Owner[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.d3Owner.length === 0) {
        this.addOwnerD3();
      }

      this.d4d8Owner = this.form.get('d4d8Owner') as FormArray;
      for (let i = 0; i < this.data.d4d8Owner.length; i++) {
        this.d4d8Owner.push(
          this.fb.group({
            seq: [this.data.d4d8Owner[i].seq, Validators.required],
            id: this.data.d4d8Owner[i].id,
            wbi: this.data.d4d8Owner[i].wbi,
            email: [this.data.d4d8Owner[i].email, Validators.required],
            role: [this.data.d4d8Owner[i].role, Validators.required],
            createDate: this.data.d4d8Owner[i].createDate,
            name: [{ value: this.data.d4d8Owner[i].name, disabled: true }, Validators.required],
            empId: this.data.d4d8Owner[i].empId,
            problemProcessId: [this.data.d4d8Owner[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.d4d8Owner.length === 0) {
        this.addOwnerD4D8();
      }

      this.fuqa = this.form.get('fuqa') as FormArray;
      for (let i = 0; i < this.data.fuqa.length; i++) {
        this.fuqa.push(
          this.fb.group({
            seq: [this.data.fuqa[i].seq, Validators.required],
            id: this.data.fuqa[i].id,
            wbi: this.data.fuqa[i].wbi,
            email: [this.data.fuqa[i].email, Validators.required],
            role: [this.data.fuqa[i].role, Validators.required],
            createDate: this.data.fuqa[i].createDate,
            name: [{ value: this.data.fuqa[i].name, disabled: true }, Validators.required],
            empId: this.data.fuqa[i].empId,
            problemProcessId: [this.data.fuqa[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.fuqa.length === 0) {
        this.addFuqa();
      }

      this.pemqa = this.form.get('pemqa') as FormArray;
      for (let i = 0; i < this.data.pemqa.length; i++) {
        this.pemqa.push(
          this.fb.group({
            seq: [this.data.pemqa[i].seq, Validators.required],
            id: this.data.pemqa[i].id,
            wbi: this.data.pemqa[i].wbi,
            email: [this.data.pemqa[i].email, Validators.required],
            role: [this.data.pemqa[i].role, Validators.required],
            createDate: this.data.pemqa[i].createDate,
            name: [{ value: this.data.pemqa[i].name, disabled: true }, Validators.required],
            empId: this.data.pemqa[i].empId,
            problemProcessId: [this.data.pemqa[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.pemqa.length === 0) {
        this.addPemqa();
      }

      this.mteEngineers = this.form.get('mteEngineers') as FormArray;
      for (let i = 0; i < this.data.mteEngineers.length; i++) {
        this.mteEngineers.push(
          this.fb.group({
            seq: [this.data.mteEngineers[i].seq, Validators.required],
            id: this.data.mteEngineers[i].id,
            wbi: this.data.mteEngineers[i].wbi,
            email: [this.data.mteEngineers[i].email, Validators.required],
            role: [this.data.mteEngineers[i].role, Validators.required],
            createDate: this.data.mteEngineers[i].createDate,
            name: [{ value: this.data.mteEngineers[i].name, disabled: true }, Validators.required],
            empId: this.data.mteEngineers[i].empId,
            problemProcessId: [this.data.mteEngineers[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.mteEngineers.length === 0) {
        this.addMteEngineers();
      }

      this.mteManagers = this.form.get('mteManagers') as FormArray;
      for (let i = 0; i < this.data.mteManagers.length; i++) {
        this.mteManagers.push(
          this.fb.group({
            seq: [this.data.mteManagers[i].seq, Validators.required],
            id: this.data.mteManagers[i].id,
            wbi: this.data.mteManagers[i].wbi,
            email: [this.data.mteManagers[i].email, Validators.required],
            role: [this.data.mteManagers[i].role, Validators.required],
            createDate: this.data.mteManagers[i].createDate,
            name: [{ value: this.data.mteManagers[i].name, disabled: true }, Validators.required],
            empId: this.data.mteManagers[i].empId,
            problemProcessId: [this.data.mteManagers[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.mteManagers.length === 0) {
        this.addMteManagers();
      }

      this.directors = this.form.get('directors') as FormArray;
      for (let i = 0; i < this.data.directors.length; i++) {
        this.directors.push(
          this.fb.group({
            seq: [this.data.directors[i].seq, Validators.required],
            id: this.data.directors[i].id,
            wbi: this.data.directors[i].wbi,
            email: [this.data.directors[i].email, Validators.required],
            role: [this.data.directors[i].role, Validators.required],
            createDate: this.data.directors[i].createDate,
            name: [{ value: this.data.directors[i].name, disabled: true }, Validators.required],
            empId: this.data.directors[i].empId,
            problemProcessId: [this.data.directors[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.directors.length === 0) {
        this.addDirectors();
      }

      this.finances = this.form.get('finances') as FormArray;
      for (let i = 0; i < this.data.finances.length; i++) {
        this.finances.push(
          this.fb.group({
            seq: [this.data.finances[i].seq, Validators.required],
            id: this.data.finances[i].id,
            wbi: this.data.finances[i].wbi,
            email: [this.data.finances[i].email, Validators.required],
            role: [this.data.finances[i].role, Validators.required],
            createDate: this.data.finances[i].createDate,
            name: [{ value: this.data.finances[i].name, disabled: true }, Validators.required],
            empId: this.data.finances[i].empId,
            problemProcessId: [this.data.finances[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.finances.length === 0) {
        this.addFinances();
      }

      this.materialOwners = this.form.get('materialOwners') as FormArray;
      for (let i = 0; i < this.data.materialOwners.length; i++) {
        this.materialOwners.push(
          this.fb.group({
            seq: [this.data.materialOwners[i].seq, Validators.required],
            id: this.data.materialOwners[i].id,
            wbi: this.data.materialOwners[i].wbi,
            email: [this.data.materialOwners[i].email, Validators.required],
            role: [this.data.materialOwners[i].role, Validators.required],
            createDate: this.data.materialOwners[i].createDate,
            name: [{ value: this.data.materialOwners[i].name, disabled: true }, Validators.required],
            empId: this.data.materialOwners[i].empId,
            problemProcessId: [this.data.materialOwners[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.materialOwners.length === 0) {
        this.addMaterialOwners();
      }

      this.teamMember = this.form.get('teamMember') as FormArray;
      for (let i = 0; i < this.data.teamMember.length; i++) {
        this.teamMember.push(
          this.fb.group({
            seq: [this.data.teamMember[i].seq, Validators.required],
            id: this.data.teamMember[i].id,
            wbi: this.data.teamMember[i].wbi,
            email: [this.data.teamMember[i].email, Validators.required],
            role: [this.data.teamMember[i].role, Validators.required],
            createDate: this.data.teamMember[i].createDate,
            name: [{ value: this.data.teamMember[i].name, disabled: true }, Validators.required],
            empId: this.data.teamMember[i].empId,
            problemProcessId: [this.data.teamMember[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.teamMember.length === 0) {
        this.addTeamMember();
      }

      this.fabMember = this.form.get('fabMember') as FormArray;
      for (let i = 0; i < this.data.fabMember.length; i++) {
        this.fabMember.push(
          this.fb.group({
            seq: [this.data.fabMember[i].seq, Validators.required],
            id: this.data.fabMember[i].id,
            wbi: this.data.fabMember[i].wbi,
            email: [this.data.fabMember[i].email, Validators.required],
            role: [this.data.fabMember[i].role, Validators.required],
            createDate: this.data.fabMember[i].createDate,
            name: [{ value: this.data.fabMember[i].name, disabled: true }, Validators.required],
            empId: this.data.fabMember[i].empId,
            problemProcessId: [this.data.fabMember[i].problemProcessId, Validators.required]
          })
        );
      }
      if (this.fabMember.length === 0) {
        this.addFabMember();
      }
    }
  }

  onPaste() {
    if (this.copy) {
      const data = this.copy;
      this.d3Owner = this.form.get('d3Owner') as FormArray;
      this.d3OwnerRemove = [];
      for (let i = 0; i < this.d3Owner.length; i++) {
        if (this.d3Owner.at(i).get('id').value > 1) {
          this.d3OwnerRemove.push(this.d3Owner.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.d3Owner);
      for (let i = 0; i < data.d3Owner.length; i++) {
        this.d3Owner.push(
          this.fb.group({
            seq: [data.d3Owner[i].seq, Validators.required],
            id: 1,
            wbi: data.d3Owner[i].wbi,
            email: [data.d3Owner[i].email, Validators.required],
            role: [data.d3Owner[i].role, Validators.required],
            createDate: data.d3Owner[i].createDate,
            name: [{ value: data.d3Owner[i].name, disabled: true }, Validators.required],
            empId: data.d3Owner[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.d4d8Owner = this.form.get('d4d8Owner') as FormArray;
      this.d4d8OwnerRemove = [];
      for (let i = 0; i < this.d4d8Owner.length; i++) {
        if (this.d4d8Owner.at(i).get('id').value > 1) {
          this.d4d8OwnerRemove.push(this.d4d8Owner.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.d4d8Owner);
      for (let i = 0; i < data.d4d8Owner.length; i++) {
        this.d4d8Owner.push(
          this.fb.group({
            seq: [data.d4d8Owner[i].seq, Validators.required],
            id: 1,
            wbi: data.d4d8Owner[i].wbi,
            email: [data.d4d8Owner[i].email, Validators.required],
            role: [data.d4d8Owner[i].role, Validators.required],
            createDate: data.d4d8Owner[i].createDate,
            name: [{ value: data.d4d8Owner[i].name, disabled: true }, Validators.required],
            empId: data.d4d8Owner[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.fuqa = this.form.get('fuqa') as FormArray;
      this.fuqaRemove = [];
      for (let i = 0; i < this.fuqa.length; i++) {
        if (this.fuqa.at(i).get('id').value > 1) {
          this.fuqaRemove.push(this.fuqa.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.fuqa);
      for (let i = 0; i < data.fuqa.length; i++) {
        this.fuqa.push(
          this.fb.group({
            seq: [data.fuqa[i].seq, Validators.required],
            id: 1,
            wbi: data.fuqa[i].wbi,
            email: [data.fuqa[i].email, Validators.required],
            role: [data.fuqa[i].role, Validators.required],
            createDate: data.fuqa[i].createDate,
            name: [{ value: data.fuqa[i].name, disabled: true }, Validators.required],
            empId: data.fuqa[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.pemqa = this.form.get('pemqa') as FormArray;
      this.pemqaRemove = [];
      for (let i = 0; i < this.pemqa.length; i++) {
        if (this.pemqa.at(i).get('id').value > 1) {
          this.pemqaRemove.push(this.pemqa.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.pemqa);
      for (let i = 0; i < data.pemqa.length; i++) {
        this.pemqa.push(
          this.fb.group({
            seq: [data.pemqa[i].seq, Validators.required],
            id: 1,
            wbi: data.pemqa[i].wbi,
            email: [data.pemqa[i].email, Validators.required],
            role: [data.pemqa[i].role, Validators.required],
            createDate: data.pemqa[i].createDate,
            name: [{ value: data.pemqa[i].name, disabled: true }, Validators.required],
            empId: data.pemqa[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.mteEngineers = this.form.get('mteEngineers') as FormArray;
      this.mteEngineersRemove = [];
      for (let i = 0; i < this.mteEngineers.length; i++) {
        if (this.mteEngineers.at(i).get('id').value > 1) {
          this.mteEngineersRemove.push(this.mteEngineers.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.mteEngineers);
      for (let i = 0; i < data.mteEngineers.length; i++) {
        this.mteEngineers.push(
          this.fb.group({
            seq: [data.mteEngineers[i].seq, Validators.required],
            id: 1,
            wbi: data.mteEngineers[i].wbi,
            email: [data.mteEngineers[i].email, Validators.required],
            role: [data.mteEngineers[i].role, Validators.required],
            createDate: data.mteEngineers[i].createDate,
            name: [{ value: data.mteEngineers[i].name, disabled: true }, Validators.required],
            empId: data.mteEngineers[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.mteManagers = this.form.get('mteManagers') as FormArray;
      this.mteManagersRemove = [];
      for (let i = 0; i < this.mteManagers.length; i++) {
        if (this.mteManagers.at(i).get('id').value > 1) {
          this.mteManagersRemove.push(this.mteManagers.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.mteManagers);
      for (let i = 0; i < data.mteManagers.length; i++) {
        this.mteManagers.push(
          this.fb.group({
            seq: [data.mteManagers[i].seq, Validators.required],
            id: 1,
            wbi: data.mteManagers[i].wbi,
            email: [data.mteManagers[i].email, Validators.required],
            role: [data.mteManagers[i].role, Validators.required],
            createDate: data.mteManagers[i].createDate,
            name: [{ value: data.mteManagers[i].name, disabled: true }, Validators.required],
            empId: data.mteManagers[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.directors = this.form.get('directors') as FormArray;
      this.directorsRemove = [];
      for (let i = 0; i < this.directors.length; i++) {
        if (this.directors.at(i).get('id').value > 1) {
          this.directorsRemove.push(this.directors.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.directors);
      for (let i = 0; i < data.directors.length; i++) {
        this.directors.push(
          this.fb.group({
            seq: [data.directors[i].seq, Validators.required],
            id: 1,
            wbi: data.directors[i].wbi,
            email: [data.directors[i].email, Validators.required],
            role: [data.directors[i].role, Validators.required],
            createDate: data.directors[i].createDate,
            name: [{ value: data.directors[i].name, disabled: true }, Validators.required],
            empId: data.directors[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.finances = this.form.get('finances') as FormArray;
      this.financesRemove = [];
      for (let i = 0; i < this.finances.length; i++) {
        if (this.finances.at(i).get('id').value > 1) {
          this.financesRemove.push(this.finances.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.finances);
      for (let i = 0; i < data.finances.length; i++) {
        this.finances.push(
          this.fb.group({
            seq: [data.finances[i].seq, Validators.required],
            id: 1,
            wbi: data.finances[i].wbi,
            email: [data.finances[i].email, Validators.required],
            role: [data.finances[i].role, Validators.required],
            createDate: data.finances[i].createDate,
            name: [{ value: data.finances[i].name, disabled: true }, Validators.required],
            empId: data.finances[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.materialOwners = this.form.get('materialOwners') as FormArray;
      this.materialOwnersRemove = [];
      for (let i = 0; i < this.materialOwners.length; i++) {
        if (this.materialOwners.at(i).get('id').value > 1) {
          this.materialOwnersRemove.push(this.materialOwners.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.materialOwners);
      for (let i = 0; i < data.materialOwners.length; i++) {
        this.materialOwners.push(
          this.fb.group({
            seq: [data.materialOwners[i].seq, Validators.required],
            id: 1,
            wbi: data.materialOwners[i].wbi,
            email: [data.materialOwners[i].email, Validators.required],
            role: [data.materialOwners[i].role, Validators.required],
            createDate: data.materialOwners[i].createDate,
            name: [{ value: data.materialOwners[i].name, disabled: true }, Validators.required],
            empId: data.materialOwners[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.teamMember = this.form.get('teamMember') as FormArray;
      this.teamMemberRemove = [];
      for (let i = 0; i < this.teamMember.length; i++) {
        if (this.teamMember.at(i).get('id').value > 1) {
          this.teamMemberRemove.push(this.teamMember.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.teamMember);
      for (let i = 0; i < data.teamMember.length; i++) {
        this.teamMember.push(
          this.fb.group({
            seq: [data.teamMember[i].seq, Validators.required],
            id: 1,
            wbi: data.teamMember[i].wbi,
            email: [data.teamMember[i].email, Validators.required],
            role: [data.teamMember[i].role, Validators.required],
            createDate: data.teamMember[i].createDate,
            name: [{ value: data.teamMember[i].name, disabled: true }, Validators.required],
            empId: data.teamMember[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }

      this.fabMember = this.form.get('fabMember') as FormArray;
      this.fabMemberRemove = [];
      for (let i = 0; i < this.fabMember.length; i++) {
        if (this.fabMember.at(i).get('id').value > 1) {
          this.fabMemberRemove.push(this.fabMember.at(i).get('id').value);
        }
      }
      this.clearFormArray(this.fabMember);
      for (let i = 0; i < data.fabMember.length; i++) {
        this.fabMember.push(
          this.fb.group({
            seq: [data.fabMember[i].seq, Validators.required],
            id: 1,
            wbi: data.fabMember[i].wbi,
            email: [data.fabMember[i].email, Validators.required],
            role: [data.fabMember[i].role, Validators.required],
            createDate: data.fabMember[i].createDate,
            name: [{ value: data.fabMember[i].name, disabled: true }, Validators.required],
            empId: data.fabMember[i].empId,
            problemProcessId: [this.data.problemProcessId, Validators.required]
          })
        );
      }
    }
  }

  onSubmit(): void {
    // TOOD
    this.submit = true;
    if (this.form.valid) {
      alertConfirm('Make sure, your information before submit', 'Are you sure ?', result => {
        if (result.value) {
          const data: any = Object.assign({}, this.form.getRawValue(), {
            d3OwnerRemove: this.d3OwnerRemove,
            d4d8OwnerRemove: this.d4d8OwnerRemove,
            fuqaRemove: this.fuqaRemove,
            pemqaRemove: this.pemqaRemove,
            mteEngineersRemove: this.mteEngineersRemove,
            mteManagersRemove: this.mteManagersRemove,
            directorsRemove: this.directorsRemove,
            financesRemove: this.financesRemove,
            materialOwnersRemove: this.materialOwnersRemove,
            teamMemberRemove: this.teamMemberRemove,
            fabMemberRemove: this.fabMemberRemove
          });
          data.d3Owner.map(this.zeroId);
          data.d4d8Owner.map(this.zeroId);
          data.fuqa.map(this.zeroId);
          data.pemqa.map(this.zeroId);
          data.mteEngineers.map(this.zeroId);
          data.mteManagers.map(this.zeroId);
          data.directors.map(this.zeroId);
          data.finances.map(this.zeroId);
          data.materialOwners.map(this.zeroId);
          data.teamMember.map(this.zeroId);
          data.fabMember.map(this.zeroId);
          this.event.emit(data);
          this.bsModalRef.hide();
        }
      });
    }
  }

  async onChange(formArray: string, event, idx: number) {
    const name: string = this[formArray].at(idx).get('name').value;
    if (name) {
      if (name.split(' ')[0]) {
        const response = await this.ajax.getUserById(name.split(' ')[0]).toPromise();
        if (response.status === 200) {
          const user: User = response.data;
          this[formArray].at(idx).patchValue({
            empId: user.empId,
            email: user.email,
            wbi: user.username
          });
        }
      }
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  addOwnerD3(): void {
    this.d3Owner = this.form.get('d3Owner') as FormArray;
    this.d3Owner.push(
      this.fb.group({
        seq: [this.d3Owner.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['D3-OWNER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addOwnerD4D8(): void {
    this.d4d8Owner = this.form.get('d4d8Owner') as FormArray;
    this.d4d8Owner.push(
      this.fb.group({
        seq: [this.d4d8Owner.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['D4D8-OWNER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addFuqa(): void {
    this.fuqa = this.form.get('fuqa') as FormArray;
    this.fuqa.push(
      this.fb.group({
        seq: [this.fuqa.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['FUQA', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addPemqa(): void {
    this.pemqa = this.form.get('pemqa') as FormArray;
    this.pemqa.push(
      this.fb.group({
        seq: [this.pemqa.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['PEMQA', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addMteEngineers(): void {
    this.mteEngineers = this.form.get('mteEngineers') as FormArray;
    this.mteEngineers.push(
      this.fb.group({
        seq: [this.mteEngineers.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['MTE-ENGINEER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addMteManagers(): void {
    this.mteManagers = this.form.get('mteManagers') as FormArray;
    this.mteManagers.push(
      this.fb.group({
        seq: [this.mteManagers.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['MTE-MANAGER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addDirectors(): void {
    this.directors = this.form.get('directors') as FormArray;
    this.directors.push(
      this.fb.group({
        seq: [this.directors.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['DIRECTOR', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addFinances(): void {
    this.finances = this.form.get('finances') as FormArray;
    this.finances.push(
      this.fb.group({
        seq: [this.finances.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['FINANCE', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addMaterialOwners(): void {
    this.materialOwners = this.form.get('materialOwners') as FormArray;
    this.materialOwners.push(
      this.fb.group({
        seq: [this.materialOwners.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['MATERIAL-OWNER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addTeamMember(): void {
    this.teamMember = this.form.get('teamMember') as FormArray;
    this.teamMember.push(
      this.fb.group({
        seq: [this.teamMember.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['TEAM-MEMBER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  addFabMember(): void {
    this.fabMember = this.form.get('fabMember') as FormArray;
    this.fabMember.push(
      this.fb.group({
        seq: [this.fabMember.length, Validators.required],
        id: 0,
        wbi: '',
        email: ['', Validators.required],
        role: ['FAB-MEMBER', Validators.required],
        createDate: [new Date().toString(), Validators.required],
        name: ['', Validators.required],
        empId: '',
        problemProcessId: [this.form.get('problemProcessId').value, Validators.required]
      })
    );
  }

  async delOwnerD3(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.d3Owner.at(idx).get('id').value !== 0 || this.d3Owner.at(idx).get('id').value !== 1) {
        this.d3OwnerRemove.push(this.d3Owner.at(idx).get('id').value);
      }
      this.d3Owner.removeAt(idx);
    }
  }

  async delOwnerD4D8(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.d4d8Owner.at(idx).get('id').value !== 0 || this.d4d8Owner.at(idx).get('id').value !== 1) {
        this.d4d8OwnerRemove.push(this.d4d8Owner.at(idx).get('id').value);
      }
      this.d4d8Owner.removeAt(idx);
    }
  }

  async delFuqa(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.fuqa.at(idx).get('id').value !== 0 || this.fuqa.at(idx).get('id').value !== 1) {
        this.fuqaRemove.push(this.fuqa.at(idx).get('id').value);
      }
      this.fuqa.removeAt(idx);
    }
  }

  async delPemqa(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.pemqa.at(idx).get('id').value !== 0 || this.pemqa.at(idx).get('id').value !== 1) {
        this.pemqaRemove.push(this.pemqa.at(idx).get('id').value);
      }
      this.pemqa.removeAt(idx);
    }
  }

  async delMteEngineers(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.mteEngineers.at(idx).get('id').value !== 0 || this.mteEngineers.at(idx).get('id').value !== 1) {
        this.mteEngineersRemove.push(this.mteEngineers.at(idx).get('id').value);
      }
      this.mteEngineers.removeAt(idx);
    }
  }

  async delMteManagers(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.mteManagers.at(idx).get('id').value !== 0 || this.mteManagers.at(idx).get('id').value !== 1) {
        this.mteManagersRemove.push(this.mteManagers.at(idx).get('id').value);
      }
      this.mteManagers.removeAt(idx);
    }
  }

  async delDirectors(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.directors.at(idx).get('id').value !== 0 || this.directors.at(idx).get('id').value !== 1) {
        this.directorsRemove.push(this.directors.at(idx).get('id').value);
      }
      this.directors.removeAt(idx);
    }
  }

  async delFinances(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.finances.at(idx).get('id').value !== 0 || this.finances.at(idx).get('id').value !== 1) {
        this.financesRemove.push(this.finances.at(idx).get('id').value);
      }
      this.finances.removeAt(idx);
    }
  }

  async delMaterialOwners(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.materialOwners.at(idx).get('id').value !== 0 || this.materialOwners.at(idx).get('id').value !== 1) {
        this.materialOwnersRemove.push(this.materialOwners.at(idx).get('id').value);
      }
      this.materialOwners.removeAt(idx);
    }
  }

  async delTeamMember(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.teamMember.at(idx).get('id').value !== 0 || this.teamMember.at(idx).get('id').value !== 1) {
        this.teamMemberRemove.push(this.teamMember.at(idx).get('id').value);
      }
      this.teamMember.removeAt(idx);
    }
  }

  async delFabMember(idx: number) {
    const confirm: SweetAlertResult = await alertConfirm();
    if (confirm.value) {
      if (this.fabMember.at(idx).get('id').value !== 0 || this.fabMember.at(idx).get('id').value !== 1) {
        this.fabMemberRemove.push(this.fabMember.at(idx).get('id').value);
      }
      this.fabMember.removeAt(idx);
    }
  }

  private clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  private zeroId(obj) {
    if (obj.id === 0 || obj.id === 1) {
      obj.id = 0;
    }
    return obj;
  }
}
