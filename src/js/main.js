/* eslint-disable prefer-destructuring */
import pivotArray from 'array-pivot';

import stationMetaData from '../public/station_meta_data.csv';
import weatherPollutionData from '../public/station_pollution_weather_data.csv'

import AppState from './state/AppState';
import NewAppState from './state/NewAppState';
import Section, { SectionSettings } from './components/Section';
import ToolTip from './components/ToolTip';
import { GraphOptions } from './graphs/GenericGraph';
import HeightMap, { HeightMapConfig } from './graphs/Heightmap';
import ProgressScaler from './helpers/ProgressScaler';
import TextBlock from './graphs/TextBlock';

const main = () => {
  // Initialise Observer App State
  window.newAppState = NewAppState;

  window.step0Progress = -10;
  window.step1Progress = -0.35;
  window.step2Progress = -0.15;
  window.step3Progress = 0.1;
  window.step4Progress = 0.2;
  window.step8Progress = 1.2;
  window.stepFinal = 10;
  // window.newAppState.scrollUTC.subscribe((utc) => {
  //   console.log(`NewAppState: scrollUTC = ${utc}`);
  // });
  // window.newAppState.scrollTemperature.subscribe((temp) => {
  //   console.log(`NewAppState: scrollTemperature = ${temp}`);
  // });
  // window.newAppState.selectedUTC.subscribe((utc) => {
  //   console.log(`NewAppState: selectedUTC = ${utc}`);
  // });
  // window.newAppState.selectedPollution.subscribe((pollution) => {
  //   console.log(`NewAppState: selectedPollution = ${pollution}`);
  // });
  // window.newAppState.selectedStation.subscribe((station) => {
  //   console.log(`NewAppState: selectedStation = ${station}`);
  // });

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
  console.log(formattedData);
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
  const sectionMap = new Section(6000, 'HeightMap', sectionMapSettings);

  // build progressscaler for section
  const sectionMapProgressScaler = new ProgressScaler(0.1, 0.9);
  sectionMap.setProgressScaler(sectionMapProgressScaler);

  // Section Title
  const sectionMapTitleOptions = new GraphOptions(null, null, null, null);
  const sectionMapTitleData = [
    { tag: 'h1', className: 'Heightmap_Title', content: 'Ulaanbaatar: Choked by Pollution' },
    { tag: 'h3', className: 'Heightmap_Subtitle', content: 'The factors that shape Ulaanbaatar’s pollution problem' },
  ];
  const sectionMapTitle = new TextBlock('Heightmap_TitleBlock', sectionMapTitleOptions, sectionMapTitleData);
  sectionMapTitle.setShowRange(window.step0Progress, window.step2Progress);
  sectionMapTitle.show();
  sectionMap.addChild(sectionMapTitle);

  const tooltip = new ToolTip(document.getElementById('tooltip'));
  tooltip.setShowRange(window.step4Progress, 2.0);
  sectionMap.addChild(tooltip);

  // Heightmap
  const hmGraphOptions = new GraphOptions(null, null, 1200, 1000);
  const hmConfig = HeightMapConfig;
  const heightMapData = { stationMetaData, stationsData, weatherData };
  const heightMap = new HeightMap('Heightmap', hmGraphOptions, heightMapData, hmConfig, sectionMap.element);
  sectionMap.addChild(heightMap);

  const heightmapTitleData = [
    {
      tag: 'p',
      className: 'Heightmap_Meta_Title',
      content: `Map of Ulaanbaatar, its Air Quality Stations and weekly PM2.5 levels (May 2017 to May 2018)<br>
      <span style="color: rgb(106, 213, 11)">&#9608;</span> Non-Ger     
      <span style="color: rgb(212, 171, 77); margin-left: 20px;"">&#9608;</span> Ger`,
    },
  ];
  const heightmapTitle = new TextBlock('Heightmap_Meta', null, heightmapTitleData);
  heightmapTitle.setShowRange(window.step4Progress, 2.0);
  sectionMap.addChild(heightmapTitle);

  const introData = [
    {
      tag: 'h2',
      className: 'Title',
      content: 'This is Ulaanbaatarr',      
    },
    {
      tag: 'p',
      className: 'Content',
      content: 'The 2017 most polluted capital city in the world.  What\'s interesting is that content content content content content content content content content content content ',
    },
  ]
  const introTitle = new TextBlock('Heightmap_Intro', null, introData);
  introTitle.setShowRange(window.step2Progress, window.step3Progress);
  sectionMap.addChild(introTitle);

  const introData2 = [
    {
      tag: 'h2',
      className: 'Title',
      content: 'Why is it like this?',      
    },
    {
      tag: 'p',
      className: 'Content',
      content: 'Blah blah blah we\'re going to explore, Blah blah blah we\'re going to explore,Blah blah blah we\'re going to explore Blah blah blah we\'re going to explore,Blah blah blah we\'re going to exploreBlah blah blah we\'re going to explore ',
    },
  ]
  const introTitle2 = new TextBlock('Heightmap_Intro', null, introData2);
  introTitle2.setShowRange(window.step3Progress, window.step4Progress);
  sectionMap.addChild(introTitle2);
  
  sectionMap.runUpdate();
  console.log('ready');
}

export default main;
