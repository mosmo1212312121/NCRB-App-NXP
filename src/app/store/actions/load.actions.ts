import { createAction, props } from '@ngrx/store';
import { Load } from '../../interfaces';

export const loading = createAction('[Load Component] Loading', props<Load>());
export const loaded = createAction('[Load Component] Loaded', props<Load>());
