import constants from '/constants.js';

const levels = [
  {
    bgAsset: 'assets/bg-2.png',
    resources: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
    ]
  },
  {
    bgAsset: 'assets/bg-3.png',
    resources: [
      [0, 0, 1, 0, 1],
      [0, 0, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]
  },
  {
    bgAsset: 'assets/bg-4.png',
    resources: [
      [0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]
  },
];

export default levels;