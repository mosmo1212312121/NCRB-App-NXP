import { createAction, props } from '@ngrx/store';
import { FollowUp } from '../../interfaces';

export const setfollowups = createAction('[FollowUp] Set', props<{ followups: FollowUp[] }>());
