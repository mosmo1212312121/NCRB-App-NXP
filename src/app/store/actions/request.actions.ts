import { createAction, props } from '@ngrx/store';
import { Initial } from '../../interfaces';

export const setrequest = createAction('[Request] Set', props<Initial>());
