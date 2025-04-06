import utils from '/utils.js';
import constants from '/constants.js';
import levels from '/levels.js';

let currentLevel = 0;
const worker = {
  x: 500,
  y: 240
};

function updateWorkerPosInDOM() {
  // moves the worker in DOM to its current position, animated with CSS transitions
  workerEl.css('left', worker.x);
  workerEl.css('top',  worker.y);
}

let wrapperEl;
let workerEl;

let workerTimeout;

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

const map = [];
(function generateDigMap() {
  for (let i=0; i<constants.GRID_ROWS; i++) {
    const row = [];
    for (let j=0; j<constants.GRID_COLS; j++) {
      row.push({digged: false});
    }
    map.push(row);
  }
})();

function dig(x, y) {
  console.log('--worker digging!--');
  utils.forEachCoord(function(j, i) {
    if (Math.abs(x-j)+Math.abs(y-i) < constants.WORKER_EFFECT_RADIUS) {
      if (!map[i][j].digged) {
        revealCell(j, i);
        map[i][j].digged = true;
        if (levels[currentLevel].resources[i][j]) {
          console.log('resource found at', i, j);
        }
      } else {
        console.log(j, i, 'already digged');
        utils.noop();
      }
    }
  });
  checkLevelEnd();
}

function checkLevelEnd() {
  const cellCountTotal = constants.GRID_ROWS * constants.GRID_COLS;
  let cellCountDigged = 0;
  utils.forEachCoord((x, y) => {
    if (map[y][x].digged) {
      cellCountDigged++;
    }
  });
  if (cellCountDigged === cellCountTotal) {
    console.log('===Level end===');
    resetDigMap();
    // TODO: empty SVG and swap levels
  }
}

function resetDigMap() {
  // NB: does not do anything else, clip mask needs updating still
  utils.forEachCoord((x, y) => {
    map[y][x].digged = false;
  });
}

function start() {
  generateGrid();
  updateWorkerPosInDOM();
}

function revealCell(x, y) {
  // TODO: keep track of what's revealed, do not add if already revealed
  const c1 = document.querySelector('svg #clip-1');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x*constants.CELL_WIDTH);
  rect.setAttribute('y', y*constants.CELL_HEIGHT);
  rect.setAttribute('width', constants.CELL_WIDTH);
  rect.setAttribute('height', constants.CELL_HEIGHT);
  c1.appendChild(rect);
}

$(document).ready(function() {
  workerEl = $(document.getElementById('worker-1'));

  wrapperEl = $(document.getElementById('main-wrapper'));
  wrapperEl.css('width', constants.WIDTH);
  wrapperEl.css('height', constants.HEIGHT);

  wrapperEl.on('click', '.cell', function() {
    if (workerTimeout) {
      console.log('--ignoring click: dig in progress--');
      return;
    }
    const cell = $(this);
    const row = cell.data('row');
    const col = cell.data('col');
    const newX = constants.CELL_WIDTH * col + constants.CELL_WIDTH/2 - constants.WORKER_SIZE/2;
    const newY = constants.CELL_HEIGHT * row + constants.CELL_HEIGHT/2 - constants.WORKER_SIZE/2;
    worker.x = newX;
    worker.y = newY;
    updateWorkerPosInDOM();
    workerTimeout = setTimeout(function() {
      workerTimeout = null;
      dig(col, row);
    }, constants.WORKER_LOCK_TIME);
  });
  start();
});
