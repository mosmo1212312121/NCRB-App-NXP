import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../components';
import { Initial } from '../../interfaces';
import { AjaxService, LogService } from '../../services';
import { flowData } from './flow.data';
declare var $: any;

@Component({
  selector: 'app-flow',
  templateUrl: 'flow.component.html',
  styleUrls: ['flow.component.scss']
})
export class FlowComponent extends BaseComponent implements OnInit, AfterViewInit {
  public diagModel: any;
  private flowData: any = flowData;

  private cx: number;
  private cy: number;

  operatorI = 0;
  operatorII = 0;

  @ViewChild('flow') flow: ElementRef;

  constructor(private ajax: AjaxService, private route: ActivatedRoute, private logService: LogService) {
    // initial component
    super(logService);
    this.setPageName('flow');
  }

  ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  ngAfterViewInit() {
    if (this.route.snapshot.paramMap.get('id')) {
      this.ajax.getRequest(parseInt(this.route.snapshot.paramMap.get('id'), 10)).subscribe(async (response: any) => {
        let linkCount = 0;
        const request: Initial = response.data.info;
        // Create link start to d1
        this.flowData['links'][linkCount.toString()] = this.createLink('start', 'd1');
        linkCount++;
        // Checking d1 is complete
        console.log('D1: ', this.d1(request));
        if (this.d1(request)) {
          this.flowData['operators']['d1']['properties']['class'] = 'flowchart-active';
          this.flowData['operators']['d1']['properties']['outputs']['output_1']['label'] = this.requestTypeName(
            request.problemType
          );
        }
        // Create link d1 to d2
        this.flowData['links'][linkCount.toString()] = this.createLink('d1', 'd2');
        switch (this.requestType(request.problemType)) {
          case 'in':
            this.flowData['links'][linkCount.toString()]['toConnector'] = 'input_1';
            break;
          case 'previous':
            this.flowData['links'][linkCount.toString()]['toConnector'] = 'input_2';
            break;
          case 'material':
            this.flowData['links'][linkCount.toString()]['toConnector'] = 'input_3';
            break;
        }
        linkCount++;
        // Checking d2 is complete
        if (this.d2(request)) {
          this.flowData['operators']['d2']['properties']['class'] = 'flowchart-active';
          if (this.requestType(request.problemType) === 'in' || this.requestType(request.problemType) === 'previous') {
            this.flowData['operators']['d2']['properties']['outputs']['output_1']['label'] = 'only lots';
          } else {
            this.flowData['operators']['d2']['properties']['outputs']['output_1']['label'] = 'lots and materials';
          }
        }
        // Create link d2 to d2_lots
        this.flowData['links'][linkCount.toString()] = this.createLink('d2', 'd2_lot');
        switch (this.requestType(request.problemType)) {
          case 'in':
            this.flowData['links'][linkCount.toString()]['toConnector'] = 'input_1';
            break;
          case 'previous':
            this.flowData['links'][linkCount.toString()]['toConnector'] = 'input_1';
            break;
          case 'material':
            this.flowData['links'][linkCount.toString()]['toConnector'] = 'input_2';
            break;
        }
        linkCount++;
        // Checking d2_lot is complete
        if (this.d2_lot(request)) {
          this.flowData['operators']['d2_lot']['properties']['class'] = 'flowchart-active';
        }

        // Create flow
        const container = $('#chart_container');
        this.cx = $('#flow').width() / 2;
        this.cy = $('#flow').height() / 2;

        const possibleZooms = [0.5, 0.75, 1, 2, 3];
        let currentZoom = 0;
        $('#flow').panzoom({});
        $('#flow').panzoom('pan', -this.cx + container.width() / 2, 0);

        container.on('mousewheel.focal', function(e) {
          e.preventDefault();
          const delta = e.delta || e.originalEvent.wheelDelta || e.originalEvent.detail;
          const zoomOut: any = delta ? delta < 0 : e.originalEvent.deltaY > 0;
          currentZoom = Math.max(0, Math.min(possibleZooms.length - 1, currentZoom + (zoomOut * 2 - 1)));
          $('#flow').flowchart('setPositionRatio', possibleZooms[currentZoom]);
          $('#flow').panzoom('zoom', possibleZooms[currentZoom], {
            animate: false,
            focal: e
          });
        });

        await setTimeout(() => {
          console.log(this.flowData);
          $(this.flow.nativeElement).flowchart({
            verticalConnection: true,
            multipleLinksOnOutput: true,
            data: this.flowData
          });
        }, 1000);
      });
    }
  }

  /* Checking and Validation */
  private requestType(problemType: number): string {
    const problemTypes: string[] = ['in', 'previous', 'material'];
    return problemTypes[problemType - 1];
  }
  private requestTypeName(problemType: number): string {
    const problemTypes: string[] = ['In process', 'Feedback previous process', 'Material'];
    return problemTypes[problemType - 1];
  }
  private d1(req: Initial): boolean {
    const {
      problemType,
      mfg,
      subMfg,
      problemProcess,
      stopAndFix,
      issueByName,
      mfg2,
      issueByGroup,
      shift,
      special
    } = req;
    switch (this.requestType(problemType)) {
      case 'in':
        return (
          mfg !== null &&
          subMfg !== null &&
          problemProcess !== null &&
          stopAndFix !== null &&
          issueByName !== null &&
          mfg2 !== null &&
          issueByGroup !== null &&
          shift !== null &&
          special !== null
        );
      case 'previous':
        return (
          mfg !== null &&
          subMfg !== null &&
          stopAndFix !== null &&
          issueByName !== null &&
          mfg2 !== null &&
          issueByGroup !== null &&
          shift !== null &&
          special !== null
        );
      case 'material':
        return (
          mfg !== null &&
          subMfg !== null &&
          problemProcess !== null &&
          stopAndFix !== null &&
          issueByName !== null &&
          issueByGroup !== null &&
          shift !== null &&
          special !== null
        );
      default:
        return false;
    }
  }
  private d2(req: Initial): boolean {
    const { problemType, rejectName, spec, operatorId, materialType, rejectDetail, ownerMaterial, category } = req;
    switch (this.requestType(problemType)) {
      case 'in':
        return (
          rejectName !== null && rejectDetail !== null && spec !== null && (category === 1 ? operatorId !== null : true)
        );
      case 'previous':
        return (
          rejectName !== null && rejectDetail !== null && spec !== null && (category === 1 ? operatorId !== null : true)
        );
      case 'material':
        return materialType !== null && rejectDetail !== null && ownerMaterial !== null && category !== null;
      default:
        return false;
    }
  }
  private d2_lot(req: Initial): boolean {
    const { problemType, lots, materials } = req;
    switch (this.requestType(problemType)) {
      case 'in':
        return lots.length > 0;
      case 'previous':
        return lots.length > 0;
      case 'material':
        return lots.length > 0 && materials.length > 0;
      default:
        return false;
    }
  }
  /* Checking and Validation */

  /** Buttons */
  getOperatorData($element) {
    const nbInputs = parseInt($element.data('nb-inputs'), 10);
    const nbOutputs = parseInt($element.data('nb-outputs'), 10);
    const data = {
      properties: {
        title: $element.text(),
        inputs: {},
        outputs: {}
      }
    };

    let i = 0;
    for (i = 0; i < nbInputs; i++) {
      data.properties.inputs['input_' + i] = {
        label: 'Input ' + (i + 1)
      };
    }
    for (i = 0; i < nbOutputs; i++) {
      data.properties.outputs['output_' + i] = {
        label: 'Output ' + (i + 1)
      };
    }

    return data;
  }
  addOutput() {
    const operatorId = 'created_operator_' + this.operatorI;
    const operatorData = {
      top: this.cx,
      left: this.cy,
      properties: {
        title: 'Operator ' + (this.operatorI + 3),
        class: 'myTest',
        inputs: {},
        outputs: {
          output_1: {
            label: 'Output 1'
          }
        }
      }
    };

    this.operatorI++;
    $(this.flow.nativeElement).flowchart('createOperator', operatorId, operatorData);
  }
  addInput() {
    const operatorId = 'created_operator_' + this.operatorI;
    const operatorData = {
      top: this.cx,
      left: this.cy,
      properties: {
        title: 'Operator ' + (this.operatorI + 3),
        class: 'myTest2',
        inputs: {
          input_1: {
            label: 'Input 1'
          }
        },
        outputs: {}
      }
    };

    this.operatorI++;
    $(this.flow.nativeElement).flowchart('createOperator', operatorId, operatorData);
  }
  addInputAndOutput() {
    const operatorId = 'created_operator_' + this.operatorI;
    const operatorData = {
      top: this.cx,
      left: this.cy,
      properties: {
        title: 'Operator ' + (this.operatorI + 3),
        class: 'myTest2',
        inputs: {
          input_1: {
            label: 'Input 1'
          }
        },
        outputs: {
          output_1: {
            label: 'Output 1'
          }
        }
      }
    };

    this.operatorI++;
    $(this.flow.nativeElement).flowchart('createOperator', operatorId, operatorData);
  }
  deleteOperationOrLink() {
    $(this.flow.nativeElement).flowchart('deleteSelected');
  }
  load() {
    $(this.flow.nativeElement).flowchart('deleteSelected');
    const data = JSON.parse(this.diagModel);
    $(this.flow.nativeElement).flowchart('setData', data);
  }
  get() {
    $(this.flow.nativeElement).flowchart('deleteSelected');
    const data = $(this.flow.nativeElement).flowchart('getData');
    this.diagModel = JSON.stringify(data, null, 2);
  }
  private createLink(start: string, end: string): any {
    return {
      fromOperator: start,
      fromConnector: 'output_1',
      fromSubConnector: 0,
      toOperator: end,
      toConnector: 'input_1',
      toSubConnector: 0
    };
  }
  /** Buttons */
}
