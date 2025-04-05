import utils from '/utils.js';
import constants from '/constants.js';

function start() {
  console.log('starting');

  setTimeout(function() {
    const c1 = document.querySelector("svg #clip-1");

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '300');
    rect.setAttribute('y', '200');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');

    c1.appendChild(rect);
  }, 2000);
}

$(document).ready(function() {
  console.log('Hello Canvas!');

  const wrapper = document.getElementById('main-wrapper');
  $(wrapper).css('width', constants.WIDTH);
  $(wrapper).css('height', constants.HEIGHT);

  start();
});
