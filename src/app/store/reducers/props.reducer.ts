import { createReducer, on } from '@ngrx/store';
import { setprops } from '../actions';
import { Prop } from '../../interfaces';

export const initialProps: Prop = {
  loadingSec: 0
};

export default createReducer(
  initialProps,
  on(setprops, (state, obj) => Object.assign({}, obj))
);
