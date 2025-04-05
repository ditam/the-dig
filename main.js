import utils from '/utils.js';
import constants from '/constants.js';

function start() {
  console.log('starting');
}

$(document).ready(function() {
  console.log('Hello Canvas!');

  const wrapper = document.getElementById('main-wrapper');
  $(wrapper).css('width', constants.WIDTH);
  $(wrapper).css('height', constants.HEIGHT);

  start();
});
