import * as d3 from 'd3';
import RadialGraph, { RadialGraphOptions } from './graphs/RadialGraph';
import groupBy from './helpers/groupBy';

const main = () => {
  d3.csv('/public/all_stations_pm25_2017.csv').then((data) => {
    const groupedData = groupBy(data, 'location');
    const formattedData = Object.keys(groupedData).map(key => groupedData[key]);
    console.log(formattedData);

    const radialGraphOptions = RadialGraphOptions;
    radialGraphOptions.width = 500;
    radialGraphOptions.height = 500;
    const graph = new RadialGraph('#seg1', formattedData, radialGraphOptions);
    graph.setTitle('PM2.5 Concentration in Ulaanbaatar 2017 by Month');
  });

  console.log('ready');
}

export default main;
