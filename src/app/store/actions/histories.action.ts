import { createAction, props } from '@ngrx/store';
import { IHistory } from '../../interfaces';

export const sethistories = createAction('[Histories] Set', props<{ histories: IHistory[] }>());
