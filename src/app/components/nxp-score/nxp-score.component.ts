import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Initial, ResponseObj, Score } from '../../interfaces';
import { AjaxService } from '../../services';
import { setscore, setstatus } from '../../store/actions';
import { initialScore } from '../../store/reducers';
import { IAppState } from '../../store/store';
import { NxpSelection } from '../nxp-input/nxp-input.module';
import { alertConfirm, alertSuccess } from '../../utils';

@Component({
  selector: 'nxp-score',
  templateUrl: './nxp-score.component.html'
})
export class NxpScoreComponent implements OnInit, OnDestroy {
  // @Input()
  // set score(score: Score) {
  //   if (score) {
  //     this.form.patchValue(score);
  //   } else {
  //     this.form.patchValue(initialScore);
  //   }
  // }
  requirements: NxpSelection[] = [
    { id: 1, label: 'Containment', value: 'd3' },
    { id: 2, label: '8D', value: 'd8' },
    { id: 3, label: '8D with 3x5 why', value: 'd8_3x5why' }
  ];
  mdrLevels: NxpSelection[] = [
    { id: 1, label: 'Device', value: 'd3' },
    { id: 2, label: 'QRB', value: 'd8' },
    { id: 3, label: 'MRB', value: 'd8_3x5why' }
  ];
  scoreBs: NxpSelection[] = [
    { id: 1, label: '1', value: 1 },
    { id: 2, label: '2', value: 2 },
    { id: 3, label: '3', value: 3 },
    { id: 4, label: '4', value: 4 }
  ];
  scoreCs: NxpSelection[] = [
    { id: 1, label: '3', value: 3 },
    { id: 2, label: '6', value: 6 },
    { id: 3, label: '8', value: 8 },
    { id: 4, label: '9', value: 9 },
    { id: 5, label: '10', value: 10 }
  ];
  form: FormGroup;
  request: Initial = null;
  requestSub: any = null;
  score: Score = initialScore;
  scoreOld: Score = initialScore;
  scoreSub: any = null;
  scoreOldSub: any = null;
  isChange: boolean = false;
  constructor(private fb: FormBuilder, private store: Store<IAppState>, private ajax: AjaxService) {
    this.form = this.fb.group({
      requirement: [{ value: '', disabled: true }],
      mdrLevel: [{ value: '', disabled: true }],
      scoreTotal: [{ value: '', disabled: true }],
      scoreA: [{ value: '', disabled: true }],
      scoreB: [{ value: '', disabled: true }],
      scoreC: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.scoreSub = this.store.pipe(select('score')).subscribe((score: Score) => {
      this.score = score;
      this.form.patchValue(this.score);
      this.calculate();
    });
    this.scoreOldSub = this.store.pipe(select('scoreOld')).subscribe((scoreOld: Score) => {
      this.scoreOld = scoreOld;
    });
    this.requestSub = this.store.pipe(select('request')).subscribe((request: Initial) => {
      this.request = request;
      if (this.form.getRawValue()['scoreTotal'] === 0 && (request.isSubmit || request.isSw1 || request.isSw2)) {
        this.calculate();
      }
      if (
        (request.isOwner || (request.isEngineer && request.isApproveAll)) &&
        (request.isAcknowledge || request.isApproveAll) &&
        !request.isSw1 &&
        !request.isSw2
      ) {
        if (this.form.get('scoreA')) {
          this.form.get('scoreA').enable();
          this.form.get('scoreA').updateValueAndValidity();
        }
      } else {
        if (this.form.get('scoreA')) {
          this.form.get('scoreA').disable();
          this.form.get('scoreA').updateValueAndValidity();
        }
      }

      if ((request.isOwner || request.isEngineer) && request.isApproveAll && !request.isSw1 && !request.isSw2) {
        this.scoreCs = this.scoreCs.filter(obj => parseInt(obj.value, 10) >= this.scoreOld.scoreC);
        if (this.form.get('scoreC')) {
          this.form.get('scoreC').enable();
          this.form.get('scoreC').updateValueAndValidity();
        }
      } else {
        if (this.form.get('scoreC')) {
          this.form.get('scoreC').disable();
          this.form.get('scoreC').updateValueAndValidity();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.scoreSub.unsubscribe();
    this.scoreOldSub.unsubscribe();
    this.requestSub.unsubscribe();
  }

  async onRefresh() {
    const result = await alertConfirm();
    if (result.value) {
      this.form.patchValue(this.scoreOld);
    }
  }

  scoreChange(event) {
    const { scoreA, scoreB, scoreC } = this.form.getRawValue();
    if (scoreA < this.scoreOld.scoreA) {
      this.form.patchValue({ scoreA: this.scoreOld.scoreA });
      return;
    }

    // set fact score has changed.
    this.isChange = true;

    // calculate score
    const scoreTotal: number = scoreA * scoreB * scoreC;

    // update score on UI
    this.form.get('scoreTotal').patchValue(scoreTotal);
    this.store.dispatch(setscore(Object.assign(this.score, { scoreA, scoreB, scoreC, scoreTotal })));
  }

  calculate() {
    const { scoreA, scoreB, scoreC } = this.form.getRawValue();
    const scoreTotal: number = scoreA * scoreB * scoreC;
    let risk = 'd3';
    // console.log('Calculate Score: ', scoreTotal);
    if (scoreTotal <= 24 && scoreA <= 2) {
      // D1 - D3
      risk = 'd3';
      this.store.dispatch(setstatus({ isD12D3: true, isD12D8: false, isD12D83x5Why: false }));
    }
    if ((scoreTotal <= 96 && scoreTotal > 24) || scoreA >= 3) {
      // D1 - D8
      risk = 'd8';
      this.store.dispatch(setstatus({ isD12D3: false, isD12D8: true, isD12D83x5Why: false }));
    }
    if (scoreTotal > 96 || scoreC >= 8) {
      // D1 - D8 and 3x5 Why
      risk = 'd8_3x5why';
      this.store.dispatch(setstatus({ isD12D3: false, isD12D8: false, isD12D83x5Why: true }));
    }
    this.form.patchValue({
      requirement: risk,
      mdrLevel: risk
    });
  }

  updateScore(): void {
    alertConfirm('Make sure, Do you want to update score..', 'Are you sure ?', async () => {
      try {
        this.score.info = this.request;
        // request to update score
        const response: ResponseObj = await this.ajax.updateScore(this.score).toPromise();
        if (response.status === 200) {
          // when request is succussful
          alertSuccess();
          this.isChange = false;

          // check appear form d3 d4 or d8
          this.calculate();
        }
      } catch (ex) {
        console.error('Score Errors: ', ex);
      } finally {
        // latest process
      }
    });
  }

  get isNewScore(): boolean {
    const score = this.form.getRawValue();
    if (this.scoreOld.scoreA !== score.scoreA) {
      return true;
    }
    if (this.scoreOld.scoreB !== score.scoreB) {
      return true;
    }
    if (this.scoreOld.scoreC !== score.scoreC) {
      return true;
    }
    if (this.scoreOld.scoreTotal !== score.scoreTotal) {
      return true;
    }
    return false;
  }
}
