import { createAction, props } from '@ngrx/store';
import { Parameter } from '../../interfaces';

export const setparameters = createAction('[Parameters] Set', props<{ parameters: Parameter[] }>());
