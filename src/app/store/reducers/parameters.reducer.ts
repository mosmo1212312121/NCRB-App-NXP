import { createReducer, on } from '@ngrx/store';
import { Parameter } from '../../interfaces';
import { setparameters } from '../actions';

export const initialParameters: Parameter[] = [];

export default createReducer(
  initialParameters,
  on(setparameters, (state, obj) => obj.parameters.slice())
);
