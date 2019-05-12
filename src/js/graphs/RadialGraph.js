import * as d3 from 'd3';
import D3Graph from './D3Graph';
import dateToString from '../helpers/dateToString';

export const RadialGraphOptions = {
  width: 200,
  height: 200,
  innerRadius: 100,
  outerRadius: 200,
  pointRadius: 20,
  centerPoint: { x: 0, y: 0 },
  levels: 4,
  margin: {
    left: 15, top: 15, right: 15, bottom: 15,
  },
  labelFactor: 1.25,
  opacityArea: 0.1,
  color: d3.scaleOrdinal(d3.schemeCategory10),
};

class RadialGraph extends D3Graph {
  cfg = {};
  constructor(target, data, options) {
    super(target, options.width, options.height, options.margin, data);

    this.cfg = options;
    this.cfg.centerPoint = {
      x: this.cfg.width / 2,
      y: this.cfg.height / 2,
    };

    this.maxValue = d3.max(data, locationData => d3.max(locationData, d => +d.pm25));
    this.allAxis = data[Object.keys(data)[0]].map(el => el.utc);
    this.dataLength = this.allAxis.length;
    this.angleSlice = (2 * Math.PI) / this.dataLength;

    this.init(data);
    this.update(data);
  }

  init(data) {
    // Setup d3 scales
    this.rScale = d3.scaleLinear()
      .range([this.cfg.innerRadius, this.cfg.outerRadius])
      .domain([0, this.maxValue]);

    this.axisGrid = this.graph.append('g')
      .attr('class', 'axisWrapper');

    this.axisGrid.selectAll('levels')
      .data(d3.range(1, this.cfg.levels + 1).reverse())
      .enter()
        .append('circle')
        .attr('class', 'axisLabel')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', d => d * this.cfg.outerRadius / this.cfg.levels)
        .attr('dy', '0.4em')
        .style('font-size', '10px')
        .attr('fill', 'none')
        .attr('stroke', '#CCC')
        .text(d => `${this.maxValue * d / this.cfg.levels}`);

    this.axis = this.axisGrid.selectAll('.axis')
      .data(this.allAxis)
      .enter()
        .append('g')
        .attr('class', 'axis');

    this.axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => this.rScale(this.maxValue * 1.1) * Math.cos(this.angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => this.rScale(this.maxValue * 1.1) * Math.sin(this.angleSlice * i - Math.PI / 2))
      .attr('class', 'line')
      .style('stroke', 'lightgrey')
      .style('stroke-width', '1px');

    this.axis.append('text')
      .attr('class', 'legend')
      .style('font-size', '11px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => this.rScale(this.maxValue * this.cfg.labelFactor) * Math.cos(this.angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => this.rScale(this.maxValue * this.cfg.labelFactor) * Math.sin(this.angleSlice * i - Math.PI / 2))
      .text(d => `${dateToString(d).mon}`)
      .attr('fill', 'grey');


    // Build radar graph
    this.radarLine = d3.lineRadial()
      .curve(d3.curveCatmullRomClosed.alpha(0.5))
      .radius(d => this.rScale(d.pm25))
      .angle((d, i) => i * this.angleSlice);

    // Create a wrapper for the blobs
    this.blobWrapper = this.graph.selectAll('.radarWrapper')
      .data(data)
      .enter().append('g')
      .attr('class', 'radarWrapper');

    // Append the backgrounds
    console.log('\tAppending Backgrounds')
    this.blobWrapper
      .append('path')
      .attr('class', 'radarArea')
      .attr('d', d => this.radarLine(d))
      .style('fill', (d, i) => this.cfg.color(i))
      .style('fill-opacity', this.cfg.opacityArea);

    // Create the outlines
    console.log('\tCreating Outlines')
    this.blobWrapper.append('path')
      .attr('class', 'radarStroke')
      .attr('d', d => this.radarLine(d))
      .style('stroke-width', '2px')
      .style('stroke', (d, i) => this.cfg.color(i))
      .style('fill', 'none');

    // Append the circles
    console.log('\tAppending Circle')
    this.blobWrapper.selectAll('.radarCircle')
      .data(d => d)
      .enter()
      .append('circle')
      .attr('class', 'radarCircle')
      .attr('r', this.cfg.dotRadius)
      .attr('cx', (d, i) => this.rScale(d.pm25) * Math.cos(this.angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => this.rScale(d.pm25) * Math.sin(this.angleSlice * i - Math.PI / 2))
      .style('fill', d => this.cfg.color(d.id))
      .style('fill-opacity', 0.8);
  }

  update(data) {

  }
}

export default RadialGraph;
