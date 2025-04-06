const params = {
  GRID_WIDTH: 1600,
  GRID_HEIGHT: 760,
  GRID_ROWS: 7,
  GRID_COLS: 10,
  WORKER_SIZE: 25, // match in CSS!
  WORKER_EFFECT_RADIUS: 3,
  WORKER_LOCK_TIME: 3000, // consider animation speed
};

// computed properties
params.CELL_WIDTH = params.GRID_WIDTH / params.GRID_COLS;
params.CELL_HEIGHT = params.GRID_HEIGHT / params.GRID_ROWS;

export default params;
