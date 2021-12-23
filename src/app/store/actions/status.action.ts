import { createAction, props } from '@ngrx/store';
import { IStatus } from '../../interfaces';

export const setstatus = createAction('[Status] Set', props<IStatus>());
