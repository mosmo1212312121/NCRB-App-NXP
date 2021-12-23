import { DOCUMENT } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, tap } from 'rxjs/operators';
import { date, version } from '../../../../package.json';
import { BaseComponent } from '../../components';
import { Menu, Prop, ResponseObj, User } from '../../interfaces';
import { AuthComponent } from '../../pages/request/modals/auth.component';
import { AjaxService, AuthService, DropdownService, LogService, MenuService, MessageService } from '../../services';
import { ParameterService } from '../../services/parameter.service';
import { setmenus, setparameters, setuser } from '../../store/actions';
import { initialParameters, initialUser } from '../../store/reducers';
import { IAppState } from '../../store/store';
import { alertConfirm } from '../../utils';
import { NavData } from '../../_nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('appSidebar') appSidebar: any;
  public version: string = version;
  public date: string = date;
  public navItems: NavData[] = [];
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  public user: User = initialUser;
  public loadInSec: number = 0;
  loggedIn: boolean = false;
  subscribes = {
    userSub: null,
    propsSub: null
  };
  bsModalRef: BsModalRef;
  loading: boolean = true;
  message: string = '';
  private intervalSignIn: any = null;
  private liveData$: any;
  constructor(
    private auth: AuthService,
    private ajax: AjaxService,
    private cdr: ChangeDetectorRef,
    private store: Store<IAppState>,
    private router: Router,
    private modalService: BsModalService,
    private param: ParameterService,
    private swPush: SwPush,
    private messageService: MessageService,
    private toastr: ToastrService,
    private dropdown: DropdownService,
    private logService: LogService,
    private menuService: MenuService,
    @Inject(DOCUMENT) _document?: any
  ) {
    // initial component
    super(logService);
    this.setPageName('');

    this.subscribes.propsSub = this.store.pipe(select('props')).subscribe((props: Prop) => {
      this.loadInSec = props.loadingSec;
    });
    this.subscribes.userSub = this.store.pipe(select('user')).subscribe((user: User) => {
      this.user = user;
    });
    this.changes = new MutationObserver(mutations => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Get Version
    // this.auth.getVersion().subscribe(response => {
    //   this.version = response.data;
    //   console.log('Test Version: ', version);
    //   console.log('User Version: ', this.version);
    // });

    // Get Notification
    // this.messageService.onSubscribe();

    // Get Message
    // this.messageService.getMessage().subscribe(async (message: any) => {
    //   const data: any = JSON.parse(message.data);
    //   data.date = moment(new Date(data.date)).format('YYYY-MM-DD HH:mm:ss');
    //   // console.log('Message => ', data);
    //   // if (this.auth.isLoggedIn && data.users.filter(user => user.empId === this.user.empId).length > 0) {
    //   //   await this.toastr
    //   //     .warning('The system will be update automatic.', 'Update Notification', {
    //   //       progressAnimation: 'decreasing',
    //   //       progressBar: true
    //   //     })
    //   //     .onHidden.toPromise();
    //   //   localStorage.removeItem('dropdowns');
    //   //   localStorage.removeItem('user');
    //   //   const authed = localStorage.getItem('basic_auth');
    //   //   const username = atob(authed.split(':')[0]).split('\\')[1];
    //   //   let response = await this.auth.loginNow(authed).toPromise();
    //   //   response = await this.dropdown.getDropdowns(true).toPromise();
    //   //   response = await this.auth.getVersion().toPromise();
    //   //   localStorage.setItem('version', response.data);
    //   //   response = await this.auth.updateVersion(username, response.data).toPromise();
    //   //   response = await this.auth.getCurrentUser(atob(authed.split(':')[0])).toPromise();
    //   //   response.data.expireIn = moment(new Date())
    //   //     .add(1, 'hours')
    //   //     .toDate()
    //   //     .getTime()
    //   //     .toString();
    //   //   localStorage.setItem('user', JSON.stringify(response.data));
    //   //   this.store.dispatch(setuser(response.data));
    //   //   this.toastr
    //   //     .success('The system was updated.', 'Update Notification', {
    //   //       progressAnimation: 'decreasing',
    //   //       progressBar: true,
    //   //       timeOut: 3000
    //   //     })
    //   //     .onHidden.toPromise();
    //   //   this.toastr
    //   //     .warning('You need to logout and login again when you complete your task.', 'Update Notification', {
    //   //       progressAnimation: 'decreasing',
    //   //       progressBar: true,
    //   //       disableTimeOut: true,
    //   //       closeButton: true
    //   //     })
    //   //     .onHidden.toPromise();
    //   //   // let timerInterval;
    //   //   // const configs: any = {
    //   //   //   title: 'มีการอัพเดทข้อมูล !',
    //   //   //   html: 'กำลังรีเฟรชใน <b></b> วินาที.',
    //   //   //   timer: 5000,
    //   //   //   timerProgressBar: true,
    //   //   //   allowOutsideClick: false,
    //   //   //   onBeforeOpen: () => {
    //   //   //     Swal.showLoading();
    //   //   //     timerInterval = setInterval(() => {
    //   //   //       const content = Swal.getContent();
    //   //   //       if (content) {
    //   //   //         const b: any = content.querySelector('b');
    //   //   //         if (b) {
    //   //   //           b.textContent = Math.round(Swal.getTimerLeft() / 1000);
    //   //   //         }
    //   //   //       }
    //   //   //     }, 100);
    //   //   //   },
    //   //   //   onClose: () => {
    //   //   //     clearInterval(timerInterval);
    //   //   //   }
    //   //   // };
    //   //   // Swal.fire(configs).then(async result => {
    //   //   //   /* Read more about handling dismissals below */
    //   //   //   if (result.dismiss === Swal.DismissReason.timer) {
    //   //   //     /* Force Loggout */
    //   //   //     localStorage.clear();
    //   //   //     this.loggedIn = false;
    //   //   //     this.store.dispatch(setuser(initialUser));

    //   //   //     /* Clear Storage */
    //   //   //     // localStorage.removeItem('user');
    //   //   //     // localStorage.removeItem('dropdowns');
    //   //   //     // localStorage.removeItem('rejectNames');
    //   //   //     // localStorage.removeItem('materialTypes');

    //   //   //     // /* Update user version */
    //   //   //     // const response = await this.auth.updateVersion(this.user.username, data.version).toPromise();

    //   //   //     // console.log('Update Version: ', response);

    //   //   //     // /* Auto Reload Page */
    //   //   //     // window.location.reload();
    //   //   //   }
    //   //   // });
    //   // }

    //   if (data.maintain === 'TRUE') {
    //     if (!localStorage.getItem('maintain')) {
    //       let timerInterval;
    //       const configs: any = {
    //         title: 'กำลังปรับปรุงระบบ !',
    //         html: 'กำลังรีเฟรชใน <b></b> วินาที.',
    //         timer: 5000,
    //         timerProgressBar: true,
    //         allowOutsideClick: false,
    //         onBeforeOpen: () => {
    //           Swal.showLoading();
    //           timerInterval = setInterval(() => {
    //             const content = Swal.getContent();
    //             if (content) {
    //               const b: any = content.querySelector('b');
    //               if (b) {
    //                 b.textContent = Math.round(Swal.getTimerLeft() / 1000);
    //               }
    //             }
    //           }, 100);
    //         },
    //         onClose: () => {
    //           clearInterval(timerInterval);
    //         }
    //       };
    //       Swal.fire(configs).then(result => {
    //         /* Read more about handling dismissals below */
    //         if (result.dismiss === Swal.DismissReason.timer) {
    //           /* Clear Storage */
    //           localStorage.setItem('maintain', data.maintain);

    //           /* Auto Reload Page */
    //           window.location.reload();
    //         }
    //       });
    //     }
    //   } else {
    //     localStorage.removeItem('maintain');
    //   }
    // });
  }

  async ngOnInit() {
    try {
      // Interval signing in.
      this.intervalSignIn = setInterval(() => {
        // Auto sign in every 30 minutes.
      }, 30 * 60 * 1000);

      let dropdowns = [];
      if (this.dropdown.isExpired()) {
        await this.dropdown.getDropdowns().toPromise();
      } else {
        dropdowns = JSON.parse(localStorage.getItem('dropdowns'));
      }

      // get menus
      const reponseObj: ResponseObj = await this.menuService.getMenus().toPromise();
      const menus: Menu[] = reponseObj.status === 200 ? reponseObj.data : [];
      this.param.getParameters().subscribe(
        (response: ResponseObj) => {
          if (response.status === 200 && response.data) {
            this.store.dispatch(setparameters({ parameters: response.data }));
          } else {
            this.store.dispatch(setparameters({ parameters: initialParameters }));
          }
        },
        err => {
          console.error(err);
        }
      );
      const maintenance: boolean = await this.auth.isMaintenance();
      this.navItems = menus
        .filter(o => o.role === 'ALL')
        .map((o, idx) => ({ ...o, ...{ attributes: { disabled: idx === 0 ? false : maintenance } } }));
      const basicAuth: string = localStorage.getItem('basic_auth');
      if (basicAuth) {
        const wbi = atob(basicAuth.split(':')[0]);
        const resp = await this.auth.getCurrentUser(wbi).toPromise();
        if (resp.status === 200 && resp.data && resp.data.empId) {
          if (resp.statusText !== 'IN-STORAGE') {
            resp.data.expireIn = moment(new Date())
              .add(1, 'hours')
              .toDate()
              .getTime()
              .toString();
            localStorage.setItem('user', JSON.stringify(resp.data));
          }
          this.store.dispatch(setuser(resp.data));
        } else {
          // no user in user group
          let rp = await this.auth.getUserByAD(wbi.split('\\')[1]).toPromise();
          console.log('No user in group: ', rp);
          const { data } = rp;
          let firstname = data.name.split(' ')[0];
          let lastname = data.name.split(' ')[2];
          let empId = data.empId;
          if (data.employeeType.toUpperCase() === 'FUNCTIONAL') {
            firstname = data.name.split(' ')[0] + data.name.split(' ')[1];
            lastname = data.name.split(' ')[2];
            empId = null;
            await this.ajax
              .createUserGroup({
                empId: empId,
                email: data.email,
                firstname: firstname,
                lastname: lastname,
                name: data.name,
                username: wbi,
                department: null,
                supervisorId: null,
                tel: null
              })
              .toPromise();
          }
          rp = await this.auth.getCurrentUser(wbi).toPromise();
          if (rp.status === 200 && rp.data && rp.data.empId) {
            if (rp.statusText !== 'IN-STORAGE') {
              rp.data.expireIn = moment(new Date())
                .add(1, 'hours')
                .toDate()
                .getTime()
                .toString();
              localStorage.setItem('user', JSON.stringify(rp.data));
            }
            this.store.dispatch(setuser(rp.data));
          } else {
            this.store.dispatch(setuser(initialUser));
          }
        }
        this.loggedIn = true;

        // General users
        if (this.auth.isLoggedIn()) {
          this.navItems = this.navItems.concat(
            menus.filter(o => o.role === 'USER').map(o => ({ ...o, ...{ attributes: { disabled: maintenance } } }))
          );
        }

        // Administrator users
        if (this.auth.isAdmin()) {
          this.navItems = this.navItems.concat(
            menus.filter(o => o.role === 'ADMIN').map(o => ({ ...o, ...{ attributes: { disabled: maintenance } } }))
          );
        }

        // Developer users
        if (this.auth.isDev()) {
          this.navItems = this.navItems.concat(
            menus.filter(o => o.role === 'DEV').map(o => ({ ...o, ...{ attributes: { disabled: maintenance } } }))
          );
        }
      } else {
        this.loggedIn = false;
      }

      if (this.appSidebar && this.appSidebar.navItemsArray) {
        this.appSidebar.navItemsArray = this.navItems;
      }

      this.store.dispatch(setmenus({ menus }));
    } catch (ex) {
      // On Crashed
      console.error('Default Layout Errors: ', ex);
    } finally {
      this.loading = false;

      /**
       * On Update Version
       */
      // this.messageService.getMessage().subscribe((msg: any) => {
      //   if (msg) {
      //     console.log('Getting messages => ', JSON.parse(msg.data));
      //   }
      // });
    }
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscribes.userSub.unsubscribe();
    this.subscribes.propsSub.unsubscribe();
    this.changes.disconnect();
    this.auth.disconnect();
    clearInterval(this.intervalSignIn);
  }

  async onLogout() {
    this.logging(`logging out from username: <b>${this.user.username.split('\\')[1]}</b>`);
    const result = await alertConfirm('Make sure, Do you want to logout ?', 'Are you sure ?');
    if (result.value) {
      this.logging(`logged out from username: <b>${this.user.username.split('\\')[1]}</b> completed`);
      localStorage.clear();
      this.loggedIn = false;
      this.store.dispatch(setuser(initialUser));
      // TODO
      window.location.reload();
    } else {
      this.logging(`canceled log out from username: <b>${this.user.username.split('\\')[1]}</b>`);
    }
  }

  onLogin(): void {
    this.bsModalRef = this.modalService.show(AuthComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {}
    });
    this.bsModalRef.content.event.subscribe((data: any) => {
      // TODO
    });
  }

  async onUpdate() {
    try {
      this.loading = true;

      this.messageService.connect();
      this.messageService.messages$
        .pipe(
          map(rows => rows),
          catchError(error => {
            throw error;
          }),
          tap({
            error: error => console.log('[Live component] Error:', error),
            complete: () => console.log('[Live component] Connection Closed')
          })
        )
        .subscribe(data => {
          console.log('[Live component] Data: ', data);
        });

      // fetching and update Dropdown
      localStorage.removeItem('dropdowns');
      const dropdowns = (await this.dropdown.getDropdowns().toPromise()).data;
      localStorage.setItem('dropdowns', JSON.stringify(dropdowns));

      // fetching and update Reject Names
      localStorage.removeItem('rejectNames');
      const rejectNames = (await this.dropdown.getDropdownReject().toPromise()).data;
      localStorage.setItem('rejectNames', JSON.stringify(rejectNames));

      // fetching and update Material Types
      localStorage.removeItem('materialTypes');
      const materialTypes = (await this.dropdown.getDropdownMaterial().toPromise()).data;
      localStorage.setItem('materialTypes', JSON.stringify(materialTypes));
    } catch (err) {
      console.log('Error on update dropdown lists: ', err);
    } finally {
      this.loading = false;
    }
  }
}
