import GenericGraph from './GenericGraph';

const d3 = require('d3');

export default class D3Graph extends GenericGraph {
  svg; // Stores the root SVG
  graph; // Stores the margined graph
  data = [];

  constructor(name, graphOptions, margin, data) {
    console.log(`D3Graph::constructor(name: ${name}, graphOptions: ${graphOptions}, margin: ${margin}, data: ${data})`);
    super(name, graphOptions, data);
    const { width, height } = graphOptions.dimensions;
    
    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    console.log(`\t selected this.element.id: ${this.element.id}`);
    console.log(this.svg);

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
