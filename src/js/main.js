/* eslint-disable prefer-destructuring */
import pivotArray from 'array-pivot';

import stationMetaData from '../public/station_meta_data.csv';
import weatherPollutionData from '../public/station_pollution_weather_data.csv'

import AppState from './state/AppState';
import Section from './components/Section';
import { GraphOptions } from './graphs/GenericGraph';
import RadialGraph, { RadialGraphOptions } from './graphs/RadialGraph';
import HeightMap, { HeightMapConfig } from './graphs/Heightmap';

const main = () => {
  // Initialise Observer App State
  window.appState = AppState;

  // Format data to be more easily segmented for each component
  const formattedData = Object.entries(pivotArray(weatherPollutionData));
  window.stationMetaData = stationMetaData;

  const stations = stationMetaData.map(row => row.location);
  const stationsData = formattedData.filter(el => stations.includes(el[0]));
  const weatherData = formattedData.find(el => el[0] === 'Weather (C)');
  // Use utc as index of data
  stationsData.index = formattedData.reduce((acc, cur) => (acc[0] === 'utc' ? acc : cur));

  // Section Map
  // Stores the main visualisation, including THREE.js map and timeline
  const SectionMap = new Section(2000, 'Intro');

  // HeightMap
  const hmGraphOptions = new GraphOptions(50, 50, 1200, 800, 'left');
  const hmConfig = HeightMapConfig;
  const heightMap = new HeightMap('Heightmap', hmGraphOptions, { stationMetaData, stationsData, weatherData }, hmConfig);
  SectionMap.addChild(heightMap);


  // Radial Graph
  const genericOptionsRadial = new GraphOptions(50, 300, 500, 500, 'right');
  const radialGraphOptions = RadialGraphOptions;
  radialGraphOptions.width = 500;
  radialGraphOptions.height = 500;
  const radialGraph = new RadialGraph('Radial', genericOptionsRadial, stationsData, radialGraphOptions);
  SectionMap.addChild(radialGraph);

  console.log('ready');
}

export default main;
