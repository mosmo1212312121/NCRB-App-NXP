import { createReducer, on } from '@ngrx/store';
import { IStatus } from '../../interfaces';
import { setstatus } from '../actions';

export const initialStatus: IStatus = {
  isD12D3: false,
  isD12D8: false,
  isD12D83x5Why: false
};

export default createReducer(
  initialStatus,
  on(setstatus, (state, obj) => Object.assign({}, obj))
);
