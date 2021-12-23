import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { Parameter, ResponseObj } from '../../../interfaces';
import { LogService } from '../../../services';
import { ParameterService } from '../../../services/parameter.service';
import { setparameters } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertSuccess } from '../../../utils';
import { EditParameterModalComponent } from './edit-parameter.modal';

@Component({
  selector: 'app-manager-parameter',
  templateUrl: './manager-parameter.component.html',
  styleUrls: ['./manager-parameter.component.scss']
})
export class ManagerParameterComponent extends BaseComponent implements OnInit {
  form: FormGroup;
  parameters: Parameter[] = [];
  otherParams: Parameter[] = [];
  ncrbOwners: Parameter[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  constructor(
    private param: ParameterService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private store: Store<IAppState>,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/parameter-management');

    this.form = this.fb.group({});
  }

  async ngOnInit() {
    try {
      let response: ResponseObj = null;
      response = await this.param.getParameters().toPromise();
      this.parameters = response.data as Parameter[];
      // filter parameters are not setting
      this.parameters = this.parameters.filter(obj => obj.ptype !== 'SETTING');
      this.ncrbOwners = this.parameters.filter(obj => obj.label === 'NCRB_OWNER');
      this.otherParams = this.parameters.filter(obj => !obj.ptype.match('GROUP'));
    } catch (ex) {
      // On Crashed
      console.error('Manager Parameter (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  async onEdit(id: number) {
    try {
      this.loading = true;
      let response: ResponseObj = await this.param.getParameter(id).toPromise();
      setTimeout(() => {
        this.loading = false;
      }, 50);
      if (response.status === 200 && response.data) {
        this.bsModalRef = this.modalService.show(EditParameterModalComponent, {
          ignoreBackdropClick: true,
          class: 'modal-lg modal-dialog-centered',
          initialState: {
            data: response.data as Parameter
          }
        });
        this.bsModalRef.content.event.subscribe(async (data: Parameter) => {
          // TODO
          try {
            this.loading = true;
            response = await this.param.updateParameter(data).toPromise();
            if (response.status === 200 && response.data) {
              const idx: number = this.parameters.findIndex(obj => obj.id === id);
              if (idx > -1) {
                this.parameters[idx].value = data.value;
              }
              this.store.dispatch(setparameters({ parameters: this.parameters }));
              alertSuccess();
            }
          } catch (ex) {
            // On Crashed
            console.error('Manager Parameter (Updating) Errors: ', ex);
          } finally {
            setTimeout(() => {
              this.loading = false;
            }, 50);
          }
        });
      }
    } catch (ex) {
      // On Crashed
      console.error('Manager Parameter (Editing) Errors: ', ex);
    }
  }

  // onAddNcrbOwner() {
  //   this.bsModalRef = this.modalService.show(AddParameterModalComponent, {
  //     ignoreBackdropClick: true,
  //     class: 'modal-lg modal-dialog-centered',
  //     initialState: {
  //       data: { label: 'NCRB_OWNER', ptype: 'PERSON_GROUP' }
  //     }
  //   });
  //   this.bsModalRef.content.event.subscribe(async (data: Parameter) => {
  //     // TODO
  //     if (
  //       -1 ===
  //       this.ncrbOwners.findIndex(obj => obj.label + obj.value + obj.ptype === data.label + data.value + data.ptype)
  //     ) {
  //       try {
  //         this.loading = true;
  //         const response = await this.param.createParameter(data).toPromise();
  //         if (response.status === 200 && response.data) {
  //           response.data.canRemove = true;
  //           this.parameters.push(response.data);
  //           this.ncrbOwners = this.parameters.filter(obj => obj.label === 'NCRB_OWNER');
  //           this.otherParams = this.parameters.filter(obj => !obj.ptype.match('GROUP'));
  //           this.store.dispatch(setparameters(Object.assign({}, this.parameters)));
  //           alertSuccess();
  //         }
  //       } catch (ex) {
  //         // On Crashed
  //       } finally {
  //         setTimeout(() => {
  //           this.loading = false;
  //         }, 50);
  //       }
  //     } else {
  //       alertWarning('Duplicate NCRB Owner');
  //     }
  //   });
  // }

  // onDeleteNcrbOwner(id: number) {
  //   alertConfirm('Make sure your information before delete.', 'Are you sure ?', async result => {
  //     if (result) {
  //       try {
  //         this.loading = true;
  //         const response = await this.param.deleteParameter(id).toPromise();
  //         if (response.status === 200 && response.data) {
  //           const idx: number = this.parameters.findIndex(obj => obj.id === id);
  //           this.parameters.splice(idx, 1);
  //           this.ncrbOwners = this.parameters.filter(obj => obj.label === 'NCRB_OWNER');
  //           this.otherParams = this.parameters.filter(obj => !obj.ptype.match('GROUP'));
  //           this.store.dispatch(setparameters(Object.assign({}, this.parameters)));
  //           alertSuccess();
  //         }
  //       } catch (ex) {
  //         // On Crashed
  //       } finally {
  //         setTimeout(() => {
  //           this.loading = false;
  //         }, 50);
  //       }
  //     }
  //   });
  // }
}
