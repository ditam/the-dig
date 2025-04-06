import utils from '/utils.js';
import constants from '/constants.js';
import levels from '/levels.js';

const workers = [
  {
    x: 500,
    y: 240,
    name: 'Areem',
    asset: 'assets/worker-1.png',
  },
  {
    x: 600,
    y: 240,
    name: 'Sanil',
    asset: 'assets/worker-2.png',
  },
  {
    x: 700,
    y: 240,
    name: 'Hork',
    asset: 'assets/worker-3.png',
  },
];

let activeWorker = 0;
(function renderWorkerPortraits() {
  const container = $('#worker-list');
  container.empty();
  workers.forEach((w, i) => {
    const worker = $('<div>').addClass('worker');
    if (w.el) {
      w.el.removeClass('active');
    }
    if (i === activeWorker) {
      worker.addClass('active');
      if (w.el) {
        w.el.addClass('active');
      }
    }
    const portrait = $('<div>').addClass('portrait').css('background-image', `url(${w.asset})`);
    const label = $('<div>').addClass('label').text(w.name);
    worker.append(portrait).append(label);
    worker.appendTo(container);

    worker.on('click', function() {
      const selectedWorker = $(this);
      if (!selectedWorker.hasClass('active')) {
        activeWorker = selectedWorker.index();
        console.log('new activeWorker:', activeWorker);
        container.find('.worker').removeClass('active');
        wrapperEl.find('.worker-marker').removeClass('active');
        workers[activeWorker].el.addClass('active');
        selectedWorker.addClass('active');
      }
    });
  });
})();

let currentLevel = 0;
function loadLevel(levelIndex) {
  let bgBeforeAsset;
  if (levelIndex === 0) {
    // we need special cases for bg-before:
    bgBeforeAsset = 'assets/bg-0.png';
  } else {
    bgBeforeAsset = levels[levelIndex-1].bgAsset;
    console.assert(bgBeforeAsset, 'No prev-level asset found for index ' + levelIndex);
  }

  const currentBg = levels[levelIndex].bgAsset;
  console.assert(bgBeforeAsset, 'No current level asset found for index ' + levelIndex);

  // replace img sources
  $('#bg-before').attr('src', bgBeforeAsset);
  $('#bg-after').attr('src', levels[currentLevel].bgAsset);

  // reset SVG clipping mask to empty
  const clipPath = document.querySelector('svg #clip-1');
  while (clipPath.firstChild) {
    clipPath.removeChild(clipPath.firstChild);
  }
}

function updateWorkerPosInDOM() {
  // moves the workers in DOM to their current position, animated with CSS transitions
  workers.forEach(w => {
    w.el.css('left', w.x);
    w.el.css('top', w.y);
  });
}

let wrapperEl;

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
        if (levels[currentLevel].resources[i] && levels[currentLevel].resources[i][j]) {
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
    currentLevel++;
    loadLevel(currentLevel);
  }
}

function resetDigMap() {
  // NB: does not do anything else, clip mask needs updating still
  utils.forEachCoord((x, y) => {
    map[y][x].digged = false;
  });
}

function start() {
  loadLevel(currentLevel);
  generateGrid();
  updateWorkerPosInDOM();
}

function revealCell(x, y) {
  const clipPath = document.querySelector('svg #clip-1');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x*constants.CELL_WIDTH);
  rect.setAttribute('y', y*constants.CELL_HEIGHT);
  rect.setAttribute('width', constants.CELL_WIDTH);
  rect.setAttribute('height', constants.CELL_HEIGHT);
  clipPath.appendChild(rect);
}

$(document).ready(function() {
  workers[0].el = $(document.getElementById('worker-1'));
  workers[0].el.addClass('active');
  workers[1].el = $(document.getElementById('worker-2'));
  workers[2].el = $(document.getElementById('worker-3'));

  wrapperEl = $(document.getElementById('main-wrapper'));
  wrapperEl.css('width', constants.GRID_WIDTH);
  wrapperEl.css('height', constants.GRID_HEIGHT);

  wrapperEl.on('click', '.cell', function() {
    if (workers[activeWorker].timeout) {
      console.log(`--ignoring click for worker ${activeWorker}: dig in progress--`);
      return;
    }
    const cell = $(this);
    const row = cell.data('row');
    const col = cell.data('col');
    const newX = constants.CELL_WIDTH * col + constants.CELL_WIDTH/2 - constants.WORKER_SIZE/2;
    const newY = constants.CELL_HEIGHT * row + constants.CELL_HEIGHT/2 - constants.WORKER_SIZE/2;
    workers[activeWorker].x = newX;
    workers[activeWorker].y = newY;
    updateWorkerPosInDOM();
    workers[activeWorker].timeout = setTimeout(function() {
      workers[activeWorker].timeout = null;
      dig(col, row);
    }, constants.WORKER_LOCK_TIME);
  });
  start();
});
