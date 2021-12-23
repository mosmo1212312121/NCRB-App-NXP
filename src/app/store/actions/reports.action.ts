import { createAction, props } from '@ngrx/store';
import { Reporter } from '../../interfaces';

export const setreportfilter = createAction('[Reports] Set Filter', props<Reporter>());
export const setreportresult = createAction('[Reports] Set Result', props<Reporter>());
