import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../../components';
import { Menu, Parameter, ResponseObj, User } from '../../../interfaces';
import { LogService, MenuService } from '../../../services';
import { ParameterService } from '../../../services/parameter.service';
import { setparameters } from '../../../store/actions';
import { IAppState } from '../../../store/store';
import { alertConfirm, alertSuccess } from '../../../utils';

@Component({
  selector: 'app-manager-menu',
  templateUrl: './manager-menu.component.html',
  styleUrls: ['./manager-menu.component.scss']
})
export class ManagerMenuComponent extends BaseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  menusAll: FormArray;
  menusUser: FormArray;
  menusAdmin: FormArray;
  menusDev: FormArray;
  parameters: Parameter[] = [];
  otherParams: Parameter[] = [];
  ncrbOwners: Parameter[] = [];
  bsModalRef: BsModalRef;
  loading: boolean = true;
  user: User = null;
  userSub: any = null;
  menusSub: any = null;
  submit: boolean = false;
  constructor(
    private menuService: MenuService,
    private param: ParameterService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private store: Store<IAppState>,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('management/menu-management');

    this.userSub = this.store.pipe(select('user')).subscribe(user => {
      this.user = user;
    });
    this.menusSub = this.store.pipe(select('menus')).subscribe(menus => {
      this.form = this.fb.group({
        menusAll: this.fb.array([]),
        menusUser: this.fb.array([]),
        menusAdmin: this.fb.array([]),
        menusDev: this.fb.array([])
      });
      this.menusAll = this.form.get('menusAll') as FormArray;
      this.menusUser = this.form.get('menusUser') as FormArray;
      this.menusAdmin = this.form.get('menusAdmin') as FormArray;
      this.menusDev = this.form.get('menusDev') as FormArray;
      this.clearFormArray(this.menusAll);
      this.clearFormArray(this.menusUser);
      this.clearFormArray(this.menusAdmin);
      this.clearFormArray(this.menusDev);
      for (let i = 0; i < menus.length; i++) {
        switch (menus[i].role) {
          case 'ALL':
            this.menusAll.push(this.fb.group({ ...menus[i], ...{ name: [menus[i].name, Validators.required] } }));
            break;
          case 'USER':
            this.menusUser.push(this.fb.group({ ...menus[i], ...{ name: [menus[i].name, Validators.required] } }));
            if (menus[i].children) {
              for (let j = 0; j < menus[i].children.length; j++) {
                this.menusUser.push(
                  this.fb.group({
                    ...menus[i].children[j],
                    ...{ name: [menus[i].children[j].name, Validators.required] }
                  })
                );
              }
            }
            break;
          case 'ADMIN':
            this.menusAdmin.push(this.fb.group({ ...menus[i], ...{ name: [menus[i].name, Validators.required] } }));
            break;
          case 'DEV':
            this.menusDev.push(this.fb.group({ ...menus[i], ...{ name: [menus[i].name, Validators.required] } }));
            break;
        }
      }
    });
  }

  async ngOnInit() {
    try {
    } catch (ex) {
      // On Crashed
      console.error('Manager Menu (Initial) Errors: ', ex);
    } finally {
      setTimeout(() => {
        this.loading = false;
      }, 50);
    }
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.menusSub.unsubscribe();
  }

  async onSave() {
    try {
      this.submit = true;
      const result = await alertConfirm();
      if (result.value && this.form.valid) {
        const data = this.form.getRawValue();
        let menus: Menu[] = [];
        menus = data.menusAll;
        menus = menus.concat(data.menusUser);
        menus = menus.concat(data.menusAdmin);
        menus = menus.concat(data.menusDev);
        const response = await this.menuService.saveMenus(menus).toPromise();
        if (response.status === 200) {
          alertSuccess().then(() => {
            window.location.reload();
          });
        }
      }
    } catch (err) {
      console.error('Error on save menus: ', err);
    }
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
}
