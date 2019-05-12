const d3 = require('d3');

export default class D3Graph {
  svg; // Stores the root SVG
  graph; // Stores the margined graph
  data = [];

  constructor(target, width, height, margin, data) {
    this.svg = d3.select(target)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
    this.graph = this.svg.append('g')
    .attr('transform', `translate( ${(width / 2 + margin.left)}, ${(height / 2 + margin.top)})`);
    
    this.margin = margin;
    this.width = width;
    this.height = height;
  }

  // eslint-disable-next-line class-methods-use-this
  init(data) {
    console.warn(`D3Graph::init(${data}) -> this function should be overridden by extended class`);
  }
  // eslint-disable-next-line class-methods-use-this
  update(data) {
    console.warn(`D3Graph::update(${data}) -> this function should be overridden by extended class`);
  }


  getSvg() {
    return this.svg;
  }

  getData() {
    return this.data;
  }

  setTitle(title, subtitle) {
    console.log(`D3Graph::setTitle(title: ${title}, subtitle: ${subtitle})`);
    this.svg.selectAll('.title')
      .append('g')
        .attr('class', 'title')
        .append('text')
          .text(title)
          .attr('transform', `translate(${this.width / 2}, ${this.margin.top / 2})`)
          .attr('text-anchor', 'center');
  }
}
