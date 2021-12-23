import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { version } from '../../../../../package.json';
import { BaseComponent } from '../../../components';
import { AuthService, LogService } from '../../../services';
import { IAppState } from '../../../store/store';
import { alertError, alertSuccess } from '../../../utils';

@Component({
  selector: 'app-change-owner',
  template: `
    <nxp-loader *ngIf="loading"></nxp-loader>
    <div class="modal-header">
      <h5 class="modal-title pull-left">Authentication</h5>
    </div>
    <div class="modal-body">
      <div class="row" [formGroup]="form">
        <div class="col-md-8 mx-auto">
          <div class="row">
            <div class="col-12">
              <nxp-input
                title="Username"
                type="text"
                [parentForm]="form"
                control="username"
                [submit]="submit"
              ></nxp-input>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <nxp-input
                title="Password"
                type="password"
                [parentForm]="form"
                control="password"
                [submit]="submit"
                (enter)="onEnter($event)"
              ></nxp-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="justify-content: center">
      <button id="btnLogin" type="button" class="btn btn-sm btn-primary mx-1" (click)="onLogin()">
        <i class="fa fa-save mr-1"></i> Login
      </button>
      <button id="btnCancel" type="button" class="btn btn-sm btn-light mx-1" (click)="onCancel()">
        <i class="fa fa-times mr-1"></i> Cancel
      </button>
    </div>
  `
})
export class AuthComponent extends BaseComponent implements OnInit, OnDestroy {
  version: string = version;
  form: FormGroup;
  submit: boolean = false;
  public event: EventEmitter<string> = new EventEmitter();
  public loading: boolean = false;
  constructor(
    private auth: AuthService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private router: Router,
    private logService: LogService
  ) {
    // initial component
    super(logService);
    this.setPageName('login (modal)');

    this.form = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.auth.disconnect();
  }

  async _onLogin() {
    const { username, password } = this.form.getRawValue();
    this.submit = true;
    if (this.form.valid) {
      try {
        this.logging(`logging in by username: <b>${username}</b>`);
        const auth: string = `${'WBI\\' + username}:${password}`;
        this.loading = true;
        const res = await this.auth.login(username, password, auth).toPromise();
        console.log('Response: ', res);
        if (res.data) {
          // Login success
          const { data } = await this.auth.getVersion().toPromise();
          const response = await this.auth.updateVersion(username, data).toPromise();
          if (response.data) {
            localStorage.clear();
            this.logging(`logged in by username: <b>${username}</b> completed`);
            localStorage.setItem('expireIn', new Date().getTime().toString());
            localStorage.setItem('version', data);
            localStorage.setItem('basic_auth', `${btoa(auth.split(':')[0])}:${btoa(auth.split(':')[1])}`);
            alertSuccess(
              `
                <p>Authorization..</p>
                <span style="color: green; white-space: pre-line;">Successfully !</span>
              `,
              'Successful!',
              () => {
                // TODO
                window.location.reload();
              }
            );
          }
        } else {
          // Login failed
          localStorage.clear();
          alertError(`<p>Authorization..</p>
        <span style="color: red; white-space: pre-line;">Please Check username or password</span>`);
          this.logging(`logging in by username: <b>${username}</b> failed`, 'ERROR');
        }
      } catch (ex) {
        console.error('Auth (Signing in) Errors: ', ex);
        this.logging(
          `logging in by username: <b>${username}</b> failed <br/>
          <pre>${JSON.stringify(ex)}</pre>`,
          'ERROR'
        );
      } finally {
        setTimeout(() => {
          this.loading = false;
          this.bsModalRef.hide();
        }, 50);
      }
    }
  }

  async onLogin() {
    const { username, password } = this.form.getRawValue();
    this.submit = true;
    if (this.form.valid) {
      try {
        this.logging(`logging in by username: <b>${username}</b>`);
        const auth: string = `${'WBI\\' + username}:${password}`;
        this.loading = true;
        const res = await this.auth.login(username, password, auth).toPromise();
        console.log('Response: ', res);
        if (res.data) {
          // Login success
          const { data } = await this.auth.getVersion().toPromise();
          const response = await this.auth.updateVersion(username, data).toPromise();
          if (response.data) {
            localStorage.clear();
            this.logging(`logged in by username: <b>${username}</b> completed`);
            localStorage.setItem('expireIn', new Date().getTime().toString());
            localStorage.setItem('version', data);
            localStorage.setItem('basic_auth', `${btoa(auth.split(':')[0])}:${btoa(auth.split(':')[1])}`);
            localStorage.setItem('username', username);
            alertSuccess(
              `
                <p>Authorization..</p>
                <span style="color: green; white-space: pre-line;">Successfully !</span>
              `,
              'Successful!',
              () => {
                // TODO
                window.location.reload();
              }
            );
          }
        } else {
          // Login failed
          localStorage.clear();
          alertError(`<p>Authorization..</p>
        <span style="color: red; white-space: pre-line;">Please Check username or password</span>`);
          this.logging(`logging in by username: <b>${username}</b> failed`, 'ERROR');
        }
      } catch (ex) {
        console.error('Auth (Signing in) Errors: ', ex);
        this.logging(
          `logging in by username: <b>${username}</b> failed <br/>
          <pre>${JSON.stringify(ex)}</pre>`,
          'ERROR'
        );
      } finally {
        setTimeout(() => {
          this.loading = false;
          this.bsModalRef.hide();
        }, 50);
      }
    }
  }

  onCancel(): void {
    this.bsModalRef.hide();
  }

  onEnter(event) {
    this.onLogin();
  }
}
