export default {
  getRandomItem: function (array) {
    return array[Math.floor(Math.random() * array.length)];
  },
  noop: function(){ return; }
}
