import { createReducer, on } from '@ngrx/store';
import { setscoreold } from '../actions';
import { initialScore } from './score.reducer';

export default createReducer(
  initialScore,
  on(setscoreold, (state, obj) => Object.assign({}, obj))
);
