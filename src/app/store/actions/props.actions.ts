import { createAction, props } from '@ngrx/store';
import { Prop } from '../../interfaces';

export const setprops = createAction('[Props] Set', props<Prop>());
