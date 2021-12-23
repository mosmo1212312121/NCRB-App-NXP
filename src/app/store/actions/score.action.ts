import { createAction, props } from '@ngrx/store';
import { Score } from '../../interfaces';

export const setscore = createAction('[Score] Set', props<Score>());
