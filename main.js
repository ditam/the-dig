import utils from './utils.js';
import constants from './constants.js';
import levels from './levels.js';

const workers = [
  {
    x: 500,
    y: 240,
    actionsLeft: 3,
    name: 'Areem',
    asset: 'assets/worker-1.png',
  }
];

const extraWorkers = [
  {
    x: 100,
    y: 750,
    actionsLeft: 3,
    name: 'Hork',
    asset: 'assets/worker-3.png',
  },
  {
    x: 50,
    y: 800,
    actionsLeft: 3,
    name: 'Sanil',
    asset: 'assets/worker-2.png',
  },
];

let activeWorker = 0;
function renderWorkerPortraits() {
  const container = $('#worker-list');
  container.empty();
  workers.forEach((w, i) => {
    const worker = $('<div>').addClass('worker');
    if (w.dead) {
      worker.addClass('dead');
    }
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
    const labelContainer = $('<div>').addClass('label-container');
    const labelBG = $('<div>').addClass('label-bg');
    const label = $('<div>').addClass('label').text(w.name);
    w.progressBarEl = labelBG;

    labelContainer.append(labelBG).append(label);
    worker.append(portrait).append(labelContainer);
    worker.appendTo(container);

    worker.on('click', function() {
      const selectedWorker = $(this);
      if (selectedWorker.hasClass('dead')) {
        errorSound.play();
      } else if (!selectedWorker.hasClass('active')) {
        activeWorker = selectedWorker.index();
        console.log('new activeWorker:', activeWorker, workers[activeWorker]);
        container.find('.worker').removeClass('active');
        wrapperEl.find('.worker-marker').removeClass('active');
        workers[activeWorker].el.addClass('active');
        selectedWorker.addClass('active');
      }
    });
  });
}

renderWorkerPortraits();

let currentLevel = 0;
let workerMaxCapacity = 3;
function loadLevel(levelIndex) {
  // reset DOM UI state
  $('.upgrade').removeClass('selected');

  // reset level state
  workers.forEach(w => {
    w.actionsLeft = workerMaxCapacity;
    w.progressBarEl.css('width', '100%');
  });
  levelResources = [0, 0, 0];

  let bgBeforeAsset;
  if (levelIndex === 0) {
    // we need special cases for bg-before:
    bgBeforeAsset = 'assets/bg-0-cut.png';
  } else {
    bgBeforeAsset = levels[levelIndex-1].bgAsset;
    console.assert(bgBeforeAsset, 'No prev-level asset found for index ' + levelIndex);
  }

  const currentBg = levels[levelIndex].bgAsset;
  console.assert(currentBg, 'No current level asset found for index ' + levelIndex);

  // replace img sources
  $('#bg-before').attr('src', bgBeforeAsset);
  $('#bg-after').attr('src', currentBg);

  // reset SVG clipping mask to empty
  const clipPath = document.querySelector('svg #clip-1');
  while (clipPath.firstChild) {
    clipPath.removeChild(clipPath.firstChild);
  }

  // call custom level effects if any
  if (levels[levelIndex].onLoad) {
    levels[levelIndex].onLoad({
      humSound: humSound,
      songs: songs,
      workers: workers,
      updateWorkers: renderWorkerPortraits,
    });
  }

  let aliveCount = 0;
  workers.forEach(w => {
    if (!w.dead) {
      aliveCount++;
      console.log('- w alive');
    } else {
      console.log('- w dead');
    }
  });
  if (aliveCount === 0) {
    endGameWithLoss('With no workers left, the dig site was abandoned. Maybe it is for the best.');
    return;
  }

  // display story dialog
  storyDialog.find('#msg').text(levels[levelIndex].storyText);
  storyDialog.show();
  if (levelIndex < 2) {
    storyDialog.find('#end-button').hide();
  } else {
    storyDialog.find('#end-button').show();
  }

  // TODO: when moving backwards (ie. resetting), remove custom effect classes
}

// DEBUG:
window.loadLevel = function(levelIndex) {
  currentLevel = levelIndex;
  loadLevel(currentLevel);
};
window.workers = workers;

function updateWorkerPosInDOM() {
  // moves the workers in DOM to their current position, animated with CSS transitions
  workers.forEach(w => {
    w.el.css('left', w.x);
    w.el.css('top', w.y);
  });
}

let wrapperEl, storyDialog;

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

let digRadius = constants.WORKER_EFFECT_RADIUS;
function dig(x, y) {
  console.log('--worker digging!--');
  digSound.play();
  utils.forEachCoord(function(j, i) {
    if (Math.abs(x-j)+Math.abs(y-i) < digRadius) {
      if (!map[i][j].digged) {
        revealCell(j, i);
        map[i][j].digged = true;
        // TODO: random resource generation with visual feedback
      } else {
        console.log(j, i, 'already digged');
        utils.noop();
      }
    }
  });
  checkLevelEnd();
}

let gameEnded = false;
function checkLevelEnd() {
  const cellCountTotal = constants.GRID_ROWS * constants.GRID_COLS;
  let cellCountDigged = 0;
  utils.forEachCoord((x, y) => {
    if (map[y][x].digged) {
      cellCountDigged++;
    }
  });
  let actionsLeft = 0;
  workers.forEach(w => {
    if (!w.dead) {
      actionsLeft += w.actionsLeft;
    }
  });
  if (actionsLeft === 0) {
    if (currentLevel === 5 && !gameEnded) {
      gameEnded = true;
      console.log('ending game');

      $('#bg-after').removeClass('clipped');

      $('<div>').addClass('tentacle t1').appendTo(wrapperEl);
      $('<div>').addClass('tentacle t2').appendTo(wrapperEl);
      $('<div>').addClass('tentacle t3').appendTo(wrapperEl);

      const endDialog = $('<div>').addClass('end-dialog');
      setTimeout(function() {
        $('<div>').addClass('tentacle-big').appendTo(wrapperEl);
      }, 3000);
      setTimeout(function() {
        screamSound.play();
      }, 5000);
      setTimeout(function() {
        endDialog.appendTo($('#game-area'));
        $('<div>').addClass('end-title').text('The Dig').appendTo(endDialog);
      }, 9000);
      setTimeout(function() {
        $('<div>').addClass('end-subtitle').text('A Ludum Dare 57 entry by ditam').appendTo(endDialog);
      }, 17000);
    } else if (!gameEnded) {
      endLevel();
    }
  }
}

const upgrades = [
  { label: 'Hire additional worker', id: 'add-worker' },
  { label: 'Increase dig radius', id: 'increase-radius' },
  { label: 'Increase worker capacity', id: 'increase-capacity' },
];

let endLevelDialog;
let levelResources = [0, 0, 0];
let totalScore = 0;
function endLevel() {
  let bonus0 = utils.getRandomItem([0, 1, 2, 3, 4, 5]);
  let bonus1 = utils.getRandomItem([0, 1, 2]);
  let bonus2 = utils.getRandomItem([0, 1]);
  levelResources[0] = workers.length * workerMaxCapacity + bonus0;
  levelResources[1] = workers.length + bonus1;
  levelResources[2] = 1 + bonus2;

  console.log('===Level end===');
  endLevelDialog.show();

  endLevelDialog.find('#header').text(`End of day ${currentLevel+1}`);

  // display end level effect if any
  if (levels[currentLevel].onEnd) {
    const msg = levels[currentLevel].onEnd({
      workers: workers
    });
    endLevelDialog.find('#special-msg').text(msg);
  } else {
    endLevelDialog.find('#special-msg').empty();
  }

  endLevelDialog.find('#count-1').text(levelResources[0]);
  endLevelDialog.find('#count-2').text(levelResources[1]);
  endLevelDialog.find('#count-3').text(levelResources[2]);

  const dailyResSum = (
    levelResources[0] * 100 +
    levelResources[1] * 500 +
    levelResources[2] * 2000
  );

  endLevelDialog.find('#upg-slot-1 span.name').text(upgrades[0].label);
  endLevelDialog.find('#upg-slot-1').data('upg-id', upgrades[0].id);

  endLevelDialog.find('#upg-slot-2 span.name').text(upgrades[1].label);
  endLevelDialog.find('#upg-slot-2').data('upg-id', upgrades[1].id);

  endLevelDialog.find('#upg-slot-3 span.name').text(upgrades[2].label);
  endLevelDialog.find('#upg-slot-3').data('upg-id', upgrades[2].id);

  endLevelDialog.find('#level-total').text(dailyResSum);
  endLevelDialog.find('#daily-total').text(dailyResSum);

  const genericUpgradeCost = 5000;

  function applySelectedUpgrade(upId) {
    console.log('applying UPG:', upId);
    if (upId === 'add-worker') {
      const newWorker = extraWorkers.shift();
      workers.push(newWorker);
      const selector = '#worker-' + workers.length;
      $(selector).removeClass('hidden');
      renderWorkerPortraits();
      updateWorkerPosInDOM();
    } else if (upId === 'increase-radius') {
      digRadius++;
      console.log('-- increased dig radius to ', digRadius);
    } else if (upId === 'increase-capacity') {
      workerMaxCapacity++;
      console.log('-- increased worker capacity to ', workerMaxCapacity);
    } else {
      console.error('Unknown upg id:', upId);
    }
  }

  function updateTotalScore(dailyScore, upgradeWasSelected) {
    totalScore += dailyScore;
    if (upgradeWasSelected) {
      totalScore -= genericUpgradeCost;
    }
    $('#score-display').text('Score: ' + totalScore);
  }

  // FIXME: do not re-add handlers on each level
  endLevelDialog.on('click', '.upgrade', function() {
    const selectedUpgrade = $(this);
    if (totalScore + dailyResSum < genericUpgradeCost) {
      // disallow selecting if can't afford
      errorSound.play();
      return;
    }
    let upgCost = 0;
    if (selectedUpgrade.hasClass('selected')) {
      selectedUpgrade.removeClass('selected');
    } else {
      endLevelDialog.find('.upgrade').removeClass('selected');
      selectedUpgrade.addClass('selected');
      upgCost = genericUpgradeCost;
    }

    endLevelDialog.find('#daily-total').text(dailyResSum-upgCost);
  });

  endLevelDialog.on('click', '.button', function() {
    const upgradeWasSelected = !!($('.upgrade.selected').length);
    let upId;
    if (upgradeWasSelected) {
      upId = $('.upgrade.selected').data('upg-id');
      applySelectedUpgrade(upId);
    }
    updateTotalScore(dailyResSum, upgradeWasSelected);

    console.log('===Starting next level===');
    endLevelDialog.hide();
    endLevelDialog.off();
    resetDigMap();
    currentLevel++;
    loadLevel(currentLevel);
  });
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

let songs, sounds, humSound;
let clickSound, digSound, errorSound, screamSound;

function endGameWithLoss(lossMsg) {
  const endDialog = $('<div>').appendTo($('#game-area')).addClass('end-dialog');
  $('<div>').addClass('end-msg').text(
    lossMsg
  ).appendTo(endDialog);
  $('<div>').addClass('end-score').text(
    `Final score: ${totalScore}`
  ).appendTo(endDialog);
  // TODO: restart
}

$(document).ready(function() {
  songs = [
    new Audio('assets/bgMusic1.mp3'),
    new Audio('assets/bgMusic2.mp3'),
    new Audio('assets/bgMusic3.mp3')
  ];

  clickSound  = new Audio('assets/sound_click.mp3');
  digSound    = new Audio('assets/sound_dig.mp3');
  errorSound  = new Audio('assets/sound_negative.mp3');
  screamSound = new Audio('assets/scream.mp3');

  sounds = [
    clickSound,
    digSound,
    errorSound,
    screamSound,
  ];

  humSound = new Audio('assets/hum.mp3');
  humSound.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);

  workers[0].el = $(document.getElementById('worker-1'));
  workers[0].el.addClass('active');
  extraWorkers[0].el = $(document.getElementById('worker-2'));
  extraWorkers[1].el = $(document.getElementById('worker-3'));

  wrapperEl = $(document.getElementById('main-wrapper'));
  wrapperEl.css('width', constants.GRID_WIDTH);
  wrapperEl.css('height', constants.GRID_HEIGHT);

  storyDialog = $(document.getElementById('story-dialog'));
  storyDialog.on('click', '#continue-button', function() {
    storyDialog.hide();
  });
  storyDialog.on('click', '#end-button', function() {
    storyDialog.hide();
    endGameWithLoss(
      'You\'ve abandoned the dig site. Cowardly, but safe.'
    );
  });

  endLevelDialog = $(document.getElementById('end-level-dialog'));

  let audioStarted = false;
  wrapperEl.on('click', '.cell', function() {
    // TODO: use splash screen

    if (!audioStarted) {
      songs[0].play();
      songs[0].addEventListener('ended', function() {
        this.pause();
        songs[1].play();
        songs[1].addEventListener('ended', function() {
          songs[1].currentTime = 0;
          songs[1].play();
        }, false);
      }, false);
      audioStarted = true;
    }

    if (storyDialog.is(':visible')) {
      errorSound.play();
      console.log(`--ignoring click for worker ${activeWorker}: story dialog is open--`);
      return;
    }

    if (endLevelDialog.is(':visible')) {
      errorSound.play();
      console.log(`--ignoring click for worker ${activeWorker}: level end dialog is open--`);
      return;
    }

    const activeWorkerObj = workers[activeWorker];
    if (activeWorkerObj.actionsLeft === 0) {
      errorSound.play();
      console.log(`--ignoring click for worker ${activeWorkerObj.name}: no actions left--`);
      return;
    }
    if (activeWorkerObj.timeout) {
      errorSound.play();
      console.log(`--ignoring click for worker ${activeWorkerObj.name}: dig in progress--`);
      return;
    }
    clickSound.play();
    const cell = $(this);
    const row = cell.data('row');
    const col = cell.data('col');
    const newX = constants.CELL_WIDTH * col + constants.CELL_WIDTH/2 - constants.WORKER_SIZE/2;
    const newY = constants.CELL_HEIGHT * row + constants.CELL_HEIGHT/2 - constants.WORKER_SIZE/2;
    activeWorkerObj.x = newX;
    activeWorkerObj.y = newY;
    updateWorkerPosInDOM();
    activeWorkerObj.timeout = setTimeout(function() {
      // FIXME: workers still dig if they are en route during level change
      activeWorkerObj.actionsLeft = activeWorkerObj.actionsLeft - 1;
      console.log(`worker ${activeWorkerObj.name}: ${activeWorkerObj.actionsLeft} actions left`);
      const progressBarWidth = (activeWorkerObj.actionsLeft / workerMaxCapacity) * 100;
      console.log('progress bar:', activeWorkerObj.progressBarEl);
      activeWorkerObj.progressBarEl.css('width', progressBarWidth + '%');
      activeWorkerObj.timeout = null;
      dig(col, row);
    }, constants.WORKER_LOCK_TIME);
  });
  start();
});
