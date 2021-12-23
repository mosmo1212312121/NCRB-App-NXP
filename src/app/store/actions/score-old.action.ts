import { createAction, props } from '@ngrx/store';
import { Score } from '../../interfaces';

export const setscoreold = createAction('[ScoreOld] Set', props<Score>());
