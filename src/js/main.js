/* eslint-disable prefer-destructuring */
import pivotArray from 'array-pivot';

import stationMetaData from '../public/station_meta_data.csv';
import weatherPollutionData from '../public/station_pollution_weather_data.csv'

import AppState from './state/AppState';
import Section, { SectionSettings } from './components/Section';
import ToolTip from './components/ToolTip';
import { GraphOptions } from './graphs/GenericGraph';
import RadialGraph, { RadialGraphSettings } from './graphs/RadialGraph';
import HeightMap, { HeightMapConfig } from './graphs/Heightmap';
import ProgressScaler from './helpers/ProgressScaler';
import TextBlock from './graphs/TextBlock';

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
  const weatherTimeData = weatherData[1].map((el, i) => ({ temp: el, utc: stationsData.index[1][i] }));

  /*
   *    SECTION MAP
   */
  // Stores the main visualisation, including THREE.js map and timeline
  const sectionMapSettings = SectionSettings;
  sectionMapSettings.backgroundColor = 'rgb(41,41,41)';
  const sectionMap = new Section(2000, 'HeightMap', sectionMapSettings);

  // build progressscaler for section
  const sectionMapProgressScaler = new ProgressScaler(0.1, 0.9);
  sectionMap.setProgressScaler(sectionMapProgressScaler);

  // Section Title
  const sectionMapTitleOptions = new GraphOptions(25, 0, 1920, 50);
  const sectionMapTitleData = [
    { tag: 'h1', className: 'HeightmapSection_Title', content: 'Ulaanbaatar: Choked by Pollution - Part 2' },
    { tag: 'h2', className: 'HeightmapSection_Subtitle', content: 'How time, space and weather shapes Ulaanbaatar\'s pollution' },
  ];
  const sectionMapTitle = new TextBlock('HeightmapSection_TitleBlock', sectionMapTitleOptions, sectionMapTitleData);
  sectionMapTitle.alwaysShow();
  sectionMap.addChild(sectionMapTitle);

  const tooltipGraphOptions = new GraphOptions(-200, -200, 200, 100);
  const tooltip = new ToolTip('ToolTip', tooltipGraphOptions, { stationsData, weatherTimeData });
  sectionMap.addChild(tooltip);

  // Heightmap
  const hmGraphOptions = new GraphOptions(50, 150, 1000, 800, 'left');
  const hmConfig = HeightMapConfig;
  const heightMapData = { stationMetaData, stationsData, weatherData };
  const heightMap = new HeightMap('Heightmap', hmGraphOptions, heightMapData, hmConfig);
  sectionMap.addChild(heightMap);

  // Heightmap title
  const heightmapTitleOptons = new GraphOptions(
    hmGraphOptions.x, hmGraphOptions.y + hmGraphOptions.height - 220,
    hmGraphOptions.width, 50,
  );
  const heightmapTitleData = [
    { tag: 'h3', className: 'HeightmapSection_Metatitle', content: 'Map of Ulaanbaatar, its Air Quality Stations and weekly PM2.5 levels (May 2017 to May 2018)' },
  ];
  const heightmapTitle = new TextBlock('Heightmap_TitleBlock', heightmapTitleOptons, heightmapTitleData);
  heightmapTitle.alwaysShow();
  sectionMap.addChild(heightmapTitle);


  // Radial Graph
  const radialGraphOptions = new GraphOptions(50, hmGraphOptions.y + 75, 500, 500, 'right');
  const radialGraphSettings = RadialGraphSettings;
  radialGraphOptions.width = 500;
  radialGraphOptions.height = 500;
  radialGraphOptions.toShowOffset = hmConfig.numWeeksToShow;
  const radialGraph = new RadialGraph('Radial', radialGraphOptions, { stationsData, stationMetaData, weatherTimeData }, radialGraphSettings);
  sectionMap.addChild(radialGraph);

  const radialGraphTitleOptions = new GraphOptions(
    radialGraphOptions.x, radialGraphOptions.y + radialGraphOptions.height,
    radialGraphOptions.width, 50, radialGraphOptions.alignment,
  );
  const RadialGraphTitleData = [
    { tag: 'h3', className: 'RadialGraph_Metatitle', content: 'Ulaanbaatar, PM2.5 levels by Pollution Station, weekly (May 2017 to May 2018)' },
  ];
  const radialGraphTitle = new TextBlock('RadialGraph_TitleBlock', radialGraphTitleOptions, RadialGraphTitleData);
  radialGraphTitle.alwaysShow();
  sectionMap.addChild(radialGraphTitle);

  sectionMap.runUpdate();

  console.log('ready');
}

export default main;
