import utils from '/utils.js';
import constants from '/constants.js';

const worker = {
  x: 500,
  y: 240
};

function updateWorkerPosInDOM() {
  // moves the worker in DOM to its current position
  workerEl.css('left', worker.x);
  workerEl.css('top',  worker.y);
}

let wrapperEl;
let workerEl;

function generateGrid() {
  for (let i=0; i<constants.GRID_ROWS; i++) {
    const rowEl = $('<div>').addClass('row');
    for (let j=0; j<constants.GRID_COLS; j++) {
      const cellEl = $('<div>').addClass('cell').data('row', i).data('col', j);
      cellEl.css('height', constants.CELL_HEIGHT);
      cellEl.css('width',  constants.CELL_WIDTH);
      rowEl.append(cellEl);
    }
    wrapperEl.append(rowEl);
  }
}

function start() {
  generateGrid();
  updateWorkerPosInDOM();

  setTimeout(function() {
    const c1 = document.querySelector('svg #clip-1');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '300');
    rect.setAttribute('y', '200');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');

    c1.appendChild(rect);
  }, 2000);
}

$(document).ready(function() {
  workerEl = $(document.getElementById('worker-1'));

  wrapperEl = $(document.getElementById('main-wrapper'));
  wrapperEl.css('width', constants.WIDTH);
  wrapperEl.css('height', constants.HEIGHT);

  wrapperEl.on('click', '.cell', function() {
    const cell = $(this);
    const row = cell.data('row');
    const col = cell.data('col');
    const newX = constants.CELL_WIDTH * col + constants.CELL_WIDTH/2 - constants.WORKER_SIZE/2;
    const newY = constants.CELL_HEIGHT * row + constants.CELL_HEIGHT/2 - constants.WORKER_SIZE/2;
    worker.x = newX;
    worker.y = newY;
    updateWorkerPosInDOM();
  });
  start();
});
