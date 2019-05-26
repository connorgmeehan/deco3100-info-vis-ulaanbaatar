/* eslint-disable prefer-destructuring */
import * as d3 from 'd3';
import clamp from 'clamp';
import D3Graph from './D3Graph';
import dateToString from '../helpers/dateToString';
import mapVal from '../helpers/mapVal';

export const RadialGraphSettings = {
  width: 200,
  height: 200,
  innerRadius: 50,
  outerRadius: 200,
  pointRadius: 20,
  centerPoint: { x: 0, y: 0 },
  levels: 4,
  toShowOffset: 4,
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
    console.log(data);
    this.data = data.stationsData;
    this.weatherTimeData = data.weatherTimeData;
    this.stationsMetaData = data.stationMetaData;
    this.index = this.data.index;
    this.maxValue = d3.max(this.data, row => d3.max(row[1]));
    this.allAxis = this.data.index[1];

    this.allAxis = [];
    for (let i = 0; i < 12; i++) {
      const val = (i < 7 ? 0 : 1);
      const dateString = new Date(Date.UTC(2017 + val, i, 1)).toString();
      this.allAxis.push(dateString)
    }
    this.dataLength = this.data[0][1].length;

    // Bind app state listener
    window.appState.hoveredStation.subscribe(this._onStationStateChange);
    window.appState.hoveredTime.subscribe(this._onTimeStateChange);


    this.init(this.data);
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
      .attr('x2', (d) => {
        const theta = this._getThetaFromUTC(d);
        return this.rScale(this.maxValue) * Math.cos(theta)
      })
      .attr('y2', (d) => {
        const theta = this._getThetaFromUTC(d);
        return this.rScale(this.maxValue) * Math.sin(theta)
      })
      .style('stroke', 'lightgrey')
      .style('stroke-width', '1px');

    this.axis.append('text')
      .attr('class', 'xAxis_Label')
      .style('font-size', '11px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => {
        const theta = this._getThetaFromUTC(d)
        return this.rScale(this.maxValue * this.cfg.labelFactor) * Math.cos(theta);
      })
      .attr('y', (d, i) => {
        const theta = this._getThetaFromUTC(d)
        return this.rScale(this.maxValue * this.cfg.labelFactor) * Math.sin(theta);
      })
      .text((d) => {
        const date = dateToString(d);
        return `${date.day}, ${date.month}`;
      })
      .attr('fill', 'grey');

    this.customRadarLine = d3.line()
      .curve(d3.curveCatmullRomClosed.alpha(0.5))
      .x((d, i) => {
        if (d) {
          const theta = this._getThetaFromUTC(this.index[1][i]);
          return Math.cos(theta)
            * mapVal(d.val, 0, this.maxValue, this.cfg.innerRadius, this.cfg.outerRadius);
        }
        return 0;
      })
      .y((d, i) => {
        if (d) {
          const theta = this._getThetaFromUTC(this.index[1][i]);
          return Math.sin(theta)
            * mapVal(d.val, 0, this.maxValue, this.cfg.innerRadius, this.cfg.outerRadius);
        }
        return 0;
      })
      .defined(d => d !== null)
      .curve(d3.curveBasis);

    // Create a wrapper for the blobs
    console.log(data)
    this.blobWrapper = this.graph.selectAll('.RadarElement')
      .data(data)
      .enter().append('g')
      .attr('class', 'RadarElement');

    // Create the outlines
    console.log('\tCreating Outlines')
    this.blobStrokes = this.blobWrapper.append('path')
      .attr('class', 'RadarElement_Stroke')
      .attr('d', d => this.customRadarLine(d[1]))
      .style('stroke', (d) => {
        console.log(d);
        const stationMetaData = this.stationsMetaData.find(el => el.location === d[0]);
        console.log(stationMetaData);
        return stationMetaData.color;
      });

    this.hoverTimeIndicator = this.graph
      .append('line')
      .attr('id', 'hoverTimeIndicator')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0)
      .attr('opacity', 0)
      .attr('stroke', 'white')
      .attr('stroke-width', '2px');

    const maxTemp = d3.max(this.weatherTimeData.map(el => el.temp));
    const minTemp = d3.min(this.weatherTimeData.map(el => el.temp));
    this.temperaturePoints = this.graph.selectAll('.TemperaturePoints')
      .append('g')
      .attr('class', 'TemperaturePoints')
      .data(this.weatherTimeData)
      .enter()
      .append('circle')
      .attr('class', 'TempPoint')
      .attr('cx', (d) => {
        const theta = this._getThetaFromUTC(d.utc)
        return this.rScale(this.maxValue) * Math.cos(theta);
      })
      .attr('cy', (d) => {
        const theta = this._getThetaFromUTC(d.utc)
        return this.rScale(this.maxValue) * Math.sin(theta);
      })
      .attr('r', 5)
      .attr('fill', (d) => {
        const val = mapVal(d.temp, minTemp, maxTemp, 255, 0);
        return `hsl(${val}, 100%, 50%)`;
      });

    this.temperaturePoints.on('mouseover', (d, i) => {
      window.appState.hoveredTime.notify(d.utc);
      console.log(`hovering temperature points ${d.temp} ${d.utc}`);
    })
    .on('mouseout', (d, i) => {
      window.appState.hoveredTime.notify(null);
    })
  }

  update(progress) {
    this.progress = progress;

    const toShowOffsetMultiplier = clamp(mapVal(progress, -0.1, 0, 0, 1), 0, 1);
    const toShowOffset = Math.floor(toShowOffsetMultiplier * this.cfg.toShowOffset);
    let maxToShow = clamp(Math.round(
      mapVal(progress, 0, 1, 0, this.dataLength),
    ), 0, this.dataLength) + toShowOffset;
    maxToShow = clamp(maxToShow, 0, this.dataLength - 1);
    const formattedData = this.data.map(
      stationData => [stationData[0], stationData[1].slice(0, maxToShow)],
    );

    this.blobStrokes
      .attr('d', (d, i) => this.customRadarLine(formattedData[i][1]))
  }

  // eslint-disable-next-line class-methods-use-this
  _getThetaFromUTC(utc) {
    const date = new Date(utc);
    return (date.getMonth() / 12 + date.getUTCDate() / 30 / 12) * 2 * Math.PI;
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

  _onTimeStateChange = (data) => {
    console.log(data);
    if (data !== null) {
      d3.select('#hoverTimeIndicator')
        .attr('x2', Math.cos(this._getThetaFromUTC(data)) * this.maxValue)
        .attr('y2', Math.sin(this._getThetaFromUTC(data)) * this.maxValue)
        .attr('opacity', 1);
    } else {
      d3.select('#hoverTimeIndicator')
        .attr('x2', 0)
        .attr('y2', 0)
        .attr('opacity', 0);
    }
  }
}

export default RadialGraph;
