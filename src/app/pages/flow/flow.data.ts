export const flowData = {
  operators: {
    start: {
      top: 100,
      left: 700,
      properties: {
        title: 'Start',
        class: 'flowchart-active',
        inputs: {},
        outputs: {
          output_1: {
            label: ''
          }
        }
      }
    },
    end: {
      top: 1120,
      left: 680,
      properties: {
        title: 'End',
        class: 'myTest',
        inputs: {
          input_1: {
            label: ''
          }
        },
        outputs: {}
      }
    },
    d1: {
      top: 260,
      left: 640,
      properties: {
        title: 'D1: Initial Information (ข้อมูลพื้นฐาน)',
        class: '',
        inputs: {
          input_1: {
            label: ''
          }
        },
        outputs: {
          output_1: {
            label: ''
          }
        }
      }
    },
    d2: {
      top: 400,
      left: 600,
      properties: {
        title: 'D2: Problem information (ข้อมูลปัญหา)',
        class: '',
        inputs: {
          input_1: {
            label: 'In Process'
          },
          input_2: {
            label: 'Feedback previous process'
          },
          input_3: {
            label: 'Material'
          }
        },
        outputs: {
          output_1: {
            label: 'In Process'
          }
        }
      }
    },
    d2_lot: {
      top: 620,
      left: 600,
      properties: {
        title: 'D2: Problem lots and materials',
        class: '',
        inputs: {
          input_1: {
            label: 'only lots'
          },
          input_2: {
            label: 'lots and materials'
          }
        },
        outputs: {
          output_1: {
            label: ''
          }
        }
      }
    },
    d3_owner_review: {
      top: 800,
      left: 680,
      properties: {
        title: 'Owner Review',
        class: '',
        inputs: {
          input_1: {
            label: ''
          }
        },
        outputs: {
          output_1: {
            label: ''
          }
        }
      }
    }
  },
  links: {},
  //   links: {
  //     '0': {
  //       fromOperator: 'start',
  //       fromConnector: 'output_1',
  //       fromSubConnector: 0,
  //       toOperator: 'd1',
  //       toConnector: 'input_1',
  //       toSubConnector: 0
  //     },
  //     '1': {
  //       fromOperator: 'd1',
  //       fromConnector: 'output_1',
  //       fromSubConnector: 0,
  //       toOperator: 'd2',
  //       toConnector: 'input_2',
  //       toSubConnector: 0
  //     },
  //     '3': {
  //       fromOperator: 'd2_lot',
  //       fromConnector: 'output_1',
  //       fromSubConnector: 0,
  //       toOperator: 'd3_owner_review',
  //       toConnector: 'input_1',
  //       toSubConnector: 0
  //     },
  //     '4': {
  //       fromOperator: 'd2',
  //       fromConnector: 'output_1',
  //       fromSubConnector: 0,
  //       toOperator: 'd2_lot',
  //       toConnector: 'input_3',
  //       toSubConnector: 0
  //     },
  //     '5': {
  //       fromOperator: 'd3_owner_review',
  //       fromConnector: 'output_1',
  //       fromSubConnector: 0,
  //       toOperator: 'end',
  //       toConnector: 'input_1',
  //       toSubConnector: 0
  //     }
  //   },
  operatorTypes: {}
};
