import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Observable, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { SseService } from './sse.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap, switchAll, retryWhen, delayWhen } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';

const URL = environment.apiUrl;
const WS_ENDPOINT = environment.wsEndpoint;

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  readonly keys = {
    publicKey: 'BOsDDTkiJd6GIuQYSOGWmo650sGJGuQMBMI7Pb7_RL_FyorQPwS_-zmqiEHrM3YVcLtwp-dIatdLohakQ09xGJQ',
    privateKey: 'Wr3OprlCmsa-h76DTw5oOj4rROHaTQsSlfC18kPsF2Y'
  };

  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.pipe(
    switchAll(),
    catchError(e => {
      throw e;
    })
  );

  constructor(
    private swPush: SwPush,
    private _zone: NgZone,
    private _sseService: SseService,
    private _http: HttpClient
  ) {}

  public getMessage(what: string): Observable<any> {
    return new Observable(obs => {
      const eventSource = this._sseService.getEventSource(`${URL ? URL : '/ncrb'}/Realtime/${what}`);

      eventSource.onmessage = event => {
        this._zone.run(() => {
          obs.next(event.data);
        });
      };

      eventSource.onerror = error => {
        this._zone.run(() => {
          obs.error(error);
        });
      };
    });
  }

  public getNotificationSubscribe(sub) {
    return this._http.post(`${URL ? URL : '/ncrb'}/Notification/Subscribe`, sub);
  }

  public getNotificationUnsubscribe(sub) {
    return this._http.post(`${URL ? URL : '/ncrb'}/Notification/Unsubscribe`, sub);
  }

  public onSubscribe() {
    console.log(this.swPush, this.swPush.isEnabled);
    this.swPush.isEnabled ? this.unsubscribe() : this.subscribe();
  }

  private unsubscribe() {
    this.swPush.subscription.subscribe(sub => {
      if (sub) {
        this.getNotificationUnsubscribe(sub).subscribe(() => {
          sub.unsubscribe();
        });
      }
    });
  }

  private subscribe() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.keys.publicKey
      })
      .then(sub => {
        const subJson = sub.toJSON();
        const pushSubscription = {
          Endpoint: subJson.endpoint,
          P256DH: subJson.keys['p256dh'],
          Auth: subJson.keys['auth']
        };
        this.getNotificationSubscribe(pushSubscription).subscribe(notification => {
          // Do Something
          console.log(notification);
        });
      })
      .catch(err => console.error('Could not subscribe to notifications', err));
  }

  public connect(cfg: { reconnect: boolean } = { reconnect: false }): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      const messages = this.socket$.pipe(
        cfg.reconnect ? this.reconnect : o => o,
        tap({
          error: error => console.log(error)
        }),
        catchError(_ => EMPTY)
      );
      this.messagesSubject$.next(messages);
    }
  }

  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(val => console.log('[Data Service] Try to reconnect', val)),
          delayWhen(_ => timer(30000))
        )
      )
    );
  }

  private getNewWebSocket() {
    return webSocket({
      url: WS_ENDPOINT,
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
          this.socket$ = undefined;
          this.connect({ reconnect: true });
        }
      }
    });
  }

  public sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  public close() {
    this.socket$.complete();
  }
}
