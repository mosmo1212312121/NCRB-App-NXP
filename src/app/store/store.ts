import { InjectionToken } from '@angular/core';
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { FollowUp, IHistory, Initial, IStatus, Menu, Parameter, Prop, Reporter, Score, User } from '../interfaces';
import {
  initialFollowup,
  initialHistories,
  initialMenu,
  initialParameters,
  initialProps,
  initialReport,
  initialRequest,
  initialScore,
  initialStatus,
  initialUser
} from './reducers';
import followupsReducer from './reducers/follow-up.reducer';
import historiesReducer from './reducers/histories.reducer';
import menusReducer from './reducers/menu.reducer';
import parametersReducer from './reducers/parameters.reducer';
import propsReducer from './reducers/props.reducer';
import reportReducer from './reducers/report.reducer';
import requestReducer from './reducers/request.reducer';
import scoreOldReducer from './reducers/score-old.reducer';
import scoreReducer from './reducers/score.reducer';
import statusReducer from './reducers/status.reducer';
import userReducer from './reducers/user.reducer';

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function(state, action) {
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<any>[] = [debug];

export const initialState: IAppState = {
  followups: initialFollowup,
  histories: initialHistories,
  menus: initialMenu,
  parameters: initialParameters,
  props: initialProps,
  reports: initialReport,
  request: initialRequest,
  score: initialScore,
  scoreOld: initialScore,
  status: initialStatus,
  user: initialUser
};

export interface IAppState {
  followups: FollowUp[];
  histories: IHistory[];
  menus: Menu[];
  parameters: Parameter[];
  props: Prop;
  reports: Reporter;
  request: Initial;
  score: Score;
  scoreOld: Score;
  status: IStatus;
  user: User;
}

export const reducers: ActionReducerMap<IAppState> = {
  followups: followupsReducer,
  histories: historiesReducer,
  menus: menusReducer,
  parameters: parametersReducer,
  props: propsReducer,
  reports: reportReducer,
  request: requestReducer,
  score: scoreReducer,
  scoreOld: scoreOldReducer,
  status: statusReducer,
  user: userReducer
};

export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<IAppState>>('root reducer');
