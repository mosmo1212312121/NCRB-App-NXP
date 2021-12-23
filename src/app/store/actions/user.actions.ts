import { createAction, props } from '@ngrx/store';
import { User } from '../../interfaces';

export const setuser = createAction('[User] Set', props<User>());
