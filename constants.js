const params = {
  WIDTH: 800,
  HEIGHT: 500,
  GRID_ROWS: 3,
  GRID_COLS: 5,
  WORKER_SIZE: 25, // match in CSS!
  WORKER_EFFECT_RADIUS: 2,
  WORKER_LOCK_TIME: 3000, // consider animation speed
};

// computed properties
params.CELL_WIDTH = params.WIDTH / params.GRID_COLS;
params.CELL_HEIGHT = params.HEIGHT / params.GRID_ROWS;

export default params;
