/* eslint-disable prefer-destructuring */
import pivotArray from 'array-pivot';

import stationMetaData from '../public/station_meta_data.csv';
import weatherPollutionData from '../public/station_pollution_weather_data.csv'

import AppState from './state/AppState';
import Section, { SectionSettings } from './components/Section';
import { GraphOptions } from './graphs/GenericGraph';
import RadialGraph, { RadialGraphOptions } from './graphs/RadialGraph';
import HeightMap, { HeightMapConfig } from './graphs/Heightmap';
import ProgressScaler from './helpers/ProgressScaler';

const main = () => {
  // Initialise Observer App State
  window.appState = AppState;
  window.appState.selectedStation.subscribe((station) => {
    if (station) {
      console.log(`main.js -> ${station.name} is the selected station (filename: ${station.filename})`);
    } else {
      console.log(`main.js -> ${station} is the selected station `);
    }
  });

  window.appState.hoveredStation.subscribe((station) => {
    console.log(`main.js -> ${station} is the hovered station`);
  });

  window.appState.hoveredTime.subscribe((time) => {
    console.log(`main.js -> ${time} is the hovered time`);
  });
  window.appState.camera.subscribe((cam) => {
    if (cam && cam.target) {
      console.log(`main.js -> ${cam.target.x} ${cam.target.y} ${cam.target.z} is the camera target`);
    }

    if (cam && cam.position) {
      console.log(`main.js -> ${cam.position.x} ${cam.position.y} ${cam.position.z} is the position target`);
    }

    if (cam && cam.callback) {
      console.log(`main.js -> ${cam.callback} is the callback`);
    }
  });


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
  const sectionMapSettings = SectionSettings;
  const SectionMap = new Section(2000, 'Intro', sectionMapSettings);

  // build progressscaler for section
  const sectionMapProgressScaler = new ProgressScaler(0.1, 0.9);
  SectionMap.setProgressScaler(sectionMapProgressScaler);

  // HeightMap
  const hmGraphOptions = new GraphOptions(50, 50, 1200, 800, 'left');
  const hmConfig = HeightMapConfig;
  const heightMapData = { stationMetaData, stationsData, weatherData };
  const heightMap = new HeightMap('Heightmap', hmGraphOptions, heightMapData, hmConfig);
  SectionMap.addChild(heightMap);

  // Radial Graph
  const genericOptionsRadial = new GraphOptions(50, 300, 500, 500, 'right');
  const radialGraphOptions = RadialGraphOptions;
  radialGraphOptions.width = 500;
  radialGraphOptions.height = 500;
  radialGraphOptions.toShowOffset = hmConfig.numWeeksToShow;
  const radialGraph = new RadialGraph('Radial', genericOptionsRadial, stationsData, radialGraphOptions);
  SectionMap.addChild(radialGraph);

  console.log('ready');
}

export default main;
