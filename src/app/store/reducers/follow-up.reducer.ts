import { createReducer, on } from '@ngrx/store';
import { FollowUp } from '../../interfaces';
import { setfollowups } from '../actions';

export const initialFollowup: FollowUp[] = [];

export default createReducer(
  initialFollowup,
  on(setfollowups, (state, obj) => obj.followups.slice())
);
