import { createReducer, on } from '@ngrx/store';
import { IHistory } from '../../interfaces';
import { sethistories } from '../actions';

export const initialHistories: IHistory[] = [];

export default createReducer(
  initialHistories,
  on(sethistories, (state, obj) => obj.histories.slice())
);
