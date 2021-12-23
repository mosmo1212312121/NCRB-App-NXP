import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { alertConfirm } from '../utils';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate()
      ? true
      : new Observable(obs => {
          alertConfirm('ต้องการทำต่อหรือไม่', 'มีการเปลี่ยนแปลงของข้อมูล', result => {
            if (result) {
              obs.next(true);
            } else {
              obs.next(false);
            }
            obs.complete();
          });
        });
  }
}
