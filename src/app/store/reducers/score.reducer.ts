import { createReducer, on } from '@ngrx/store';
import { Score } from '../../interfaces';
import { setscore } from '../actions';

export const initialScore: Score = {
  scoreA: 0,
  scoreB: 0,
  scoreC: 0,
  scoreTotal: 0,
  requirement: 'd3',
  mdrLevel: 'd3',
  risk: 'd3',
  info: null
};

export default createReducer(
  initialScore,
  on(setscore, (state, obj) => Object.assign({}, obj))
);
