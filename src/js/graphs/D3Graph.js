const d3 = require('d3');

export default class D3Graph {
  svg;
  constructor(target, width, height) {
    this.svg = 
      d3.select(target)
        .append('svg')
          .attr('width', width)
          .attr('height', height);
  }

  init() {

  }

  update() {
    
  }

  getSvg() {
    return this.svg;
  }
}