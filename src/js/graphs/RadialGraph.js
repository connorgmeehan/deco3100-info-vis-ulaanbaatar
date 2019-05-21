/* eslint-disable prefer-destructuring */
import * as d3 from 'd3';
import D3Graph from './D3Graph';
import dateToString from '../helpers/dateToString';

export const RadialGraphOptions = {
  width: 200,
  height: 200,
  innerRadius: 50,
  outerRadius: 200,
  pointRadius: 20,
  centerPoint: { x: 0, y: 0 },
  levels: 4,
  margin: {
    left: 15, top: 15, right: 15, bottom: 15,
  },
  labelFactor: 1.25,
  opacityArea: 0.0,
  dotRadius: 5,
  color: d3.scaleOrdinal(d3.schemeCategory10),
};

class RadialGraph extends D3Graph {
  cfg = {};
  constructor(name, graphOptions, data, options) {
    console.log(`RadialGraph::constructor(name: ${name}, graphOptions: ${graphOptions}, data: ${data.length}, options: ${options})`);
    super(name, graphOptions, options.margin, data);

    this.cfg = options;
    this.cfg.centerPoint = {
      x: this.cfg.width / 2,
      y: this.cfg.height / 2,
    };

    this.maxValue = d3.max(data, row => d3.max(row[1]));
    this.allAxis = data.index[1];
    this.dataLength = data[0][1].length;
    this.angleSlice = (2 * Math.PI) / this.dataLength;
    this.init(data);
  }

  init(data) {
    console.log(`RadialGraph::init(data.legth: ${data.length})`);
    // Setup d3 scales
    this.rScale = d3.scaleLinear()
      .range([this.cfg.innerRadius, this.cfg.outerRadius])
      .domain([0, this.maxValue]);

    this.axisGrid = this.graph.append('g')
      .attr('class', 'yAxis_Wrapper');

    this.axisGrid.selectAll('.yAxis_Wrapper')
      .data(d3.range(1, this.cfg.levels + 1).reverse())
      .enter()
        .append('circle')
        .attr('class', 'yAxis_Marks')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', d => d * this.cfg.outerRadius / this.cfg.levels)
        .attr('dy', '0.4em')
        .style('font-size', '10px')
        .attr('fill', 'none')
        .attr('stroke', '#CCC')
        .text(d => `${this.maxValue * d / this.cfg.levels}`);

    this.axis = this.axisGrid.selectAll('.xAxis_Wrapper')
      .data(this.allAxis)
      .enter()
        .append('g')
        .attr('class', 'xAxis_Wrapper');

    this.axis.append('line')
      .attr('class', 'xAxis_Line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => this.rScale(this.maxValue * 1.1) * Math.cos(this.angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => this.rScale(this.maxValue * 1.1) * Math.sin(this.angleSlice * i - Math.PI / 2))
      .style('stroke', 'lightgrey')
      .style('stroke-width', '1px');

    this.axis.append('text')
      .attr('class', 'xAxis_Label')
      .style('font-size', '11px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => this.rScale(this.maxValue * this.cfg.labelFactor) * Math.cos(this.angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => this.rScale(this.maxValue * this.cfg.labelFactor) * Math.sin(this.angleSlice * i - Math.PI / 2))
      .text((d) => {
        const date = dateToString(d);
        return `${date.day}, ${date.month}`;
      })
      .attr('fill', 'grey');


    // Build radar graph
    this.radarLine = d3.lineRadial()
      .curve(d3.curveCatmullRomClosed.alpha(0.5))
      .radius(d => this.rScale(d))
      .angle((d, i) => i * this.angleSlice);

    // Create a wrapper for the blobs
    this.blobWrapper = this.graph.selectAll('.RadarElement')
      .data(data)
      .enter().append('g')
      .attr('class', 'RadarElement');

    // Append the backgrounds
    console.log('\tAppending Backgrounds')
    this.blobWrapper
      .append('path')
      .attr('class', 'RadarElement_Area')
      .attr('d', d => this.radarLine(d[1]))
      .style('fill', d => this.cfg.color(d[0]))
      .style('fill-opacity', this.cfg.opacityArea);

    // Create the outlines
    console.log('\tCreating Outlines')
    this.blobWrapper.append('path')
      .attr('class', 'RadarElement_Stroke')
      .attr('d', d => this.radarLine(d[1]))
      .style('stroke', d => this.cfg.color(d[0]))

    // Append the circles
    console.log('\tAppending Circle')
    this.blobWrapper.selectAll('.RadarElement_Circle')
      .append('circle')
      .attr('class', 'RadarElementCircle')
      .attr('r', this.cfg.dotRadius)
      .attr('cx', (d, i) => this.rScale(d[1]) * Math.cos(this.angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => this.rScale(d[1]) * Math.sin(this.angleSlice * i - Math.PI / 2))
      .style('fill', d => this.cfg.color(d[0]))
      .style('fill-opacity', 0.8);

    // Bind app state listener
    window.appState.selectedStation.subscribe(this._onStationStateChange);
  }

  update(progress, scrollDistance) {
    this.progress = progress;
    this.scrollDistance = scrollDistance;
  }

  _onStationStateChange = (data) => {
    this.blobWrapper
    .attr('class', (d, i) => {
      if (d[0] === data) {
        return 'RadarElement active';
      }
      return 'RadarElement';
    })
    .filter(d => d[0] === data)
    .raise()
  }
}

export default RadialGraph;
