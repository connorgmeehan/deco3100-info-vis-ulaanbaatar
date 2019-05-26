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
  const sectionMap = new Section(6000, 'HeightMap', sectionMapSettings);

  // build progressscaler for section
  const sectionMapProgressScaler = new ProgressScaler(0.1, 0.9);
  sectionMap.setProgressScaler(sectionMapProgressScaler);

  // Section Title
  const sectionMapTitleOptions = new GraphOptions(25, 0, 1920, 50);
  const sectionMapTitleData = [
    { tag: 'h1', className: 'HeightmapSection_Title', content: 'Ulaanbaatar: Choked by Pollution - Part 2' },
    { tag: 'h2', className: 'HeightmapSection_Subtitle', content: 'The factors that shape Ulaanbaatar’s pollution problem' },
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
    {
      tag: 'h3',
      className: 'HeightmapSection_Metatitle',
      content: `Map of Ulaanbaatar, its Air Quality Stations and weekly PM2.5 levels (May 2017 to May 2018)<br>
      <span style="color: rgb(106, 213, 11)">&#9608;</span> Non-Ger     
      <span style="color: rgb(212, 171, 77); margin-left: 20px;"">&#9608;</span> Ger`,
    },
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

  // Add context text
  const contextTextOptions = new GraphOptions(
    radialGraphOptions.x, radialGraphOptions.y - 200,
    radialGraphOptions.width, 200, 'right',
  );

  // For each text that we want to show
  const contextText1Data = [
    { tag: 'h4', className: 'SectionMap_ContextText', content: 'Taking a closer look at Ulaanbaatar reveals how factors such as seasonal temperatures and location play a role in its unique pollution problem.' },
  ];
  const contextText1 = new TextBlock('ContextText_TextBlock', contextTextOptions, contextText1Data) // make sure last parameter = the new data.
  contextText1.setShowRange(0.02, 0.27);
  sectionMap.addChild(contextText1);

  const contextText2Data = [
    { tag: 'h4', className: 'SectionMap_ContextText', content: 'As the coldest capital city, residents without access to electricity are forced to burn coal, wood and sometimes rubbish to stay warm in the freezing temperatures.' },
  ];
  const contextText2 = new TextBlock('ContextText_TextBlock', contextTextOptions, contextText2Data) // make sure last parameter = the new data.
  contextText2.setShowRange(0.29, 0.49);
  sectionMap.addChild(contextText2);

  const contextText3Data = [
    { tag: 'h4', className: 'SectionMap_ContextText', content: 'These residents typically live in ger areas which are sprawling informal settlements on the city’s outskirts.' },
  ];
  const contextText3 = new TextBlock('ContextText_TextBlock', contextTextOptions, contextText3Data) // make sure last parameter = the new data.
  contextText3.setShowRange(0.51, 0.63);
  sectionMap.addChild(contextText3);

  const contextText4Data = [
    { tag: 'h4', className: 'SectionMap_ContextText', content: 'This map shows how ‘ger’ areas are exposed to significantly higher levels of pollution than ‘non-ger’ areas.' },
  ];
  const contextText4 = new TextBlock('ContextText_TextBlock', contextTextOptions, contextText4Data) // make sure last parameter = the new data.
  contextText4.setShowRange(0.65, 0.79);
  sectionMap.addChild(contextText4);

  const contextText5Data = [
    { tag: 'h4', className: 'SectionMap_ContextText', content: 'These levels spike particularly in the winter months as temperatures drop to below zero.' },
  ];
  const contextText5 = new TextBlock('ContextText_TextBlock', contextTextOptions, contextText5Data) // make sure last parameter = the new data.
  contextText5.setShowRange(0.82, 0.90);
  sectionMap.addChild(contextText5);

  const contextText6Data = [
    { tag: 'h5', className: 'SectionMap_ContextText', content: 'Ger / Non Ger defined by: Purevtseren, M., Tsegmid, B., Indra, M. and Sugar, M. (2018). The Fractal Geometry of Urban Land Use: The Case of Ulaanbaatar City, Mongolia. Land, 7(2), p.67. \n PM2.5 Readings: OpenAQ, 2019, Mongolia. 2017 Obtained from: https://openaq.org/#/countries/MN?_k=dp8u8e [Accessed 26 May. 2019]. \n Weather: Rp5.ru. 2019. Weather archive in Ulan Bator 2017-2018. Obtained from: https://rp5.ru/Weather_archive_in_Ulan_Bator [Accessed 14 Apr. 2019].' },
  ];
  const contextText6 = new TextBlock('ContextText_TextBlock', contextTextOptions, contextText6Data) // make sure last parameter = the new data.
  contextText6.setShowRange(0.92, 1.2);
  sectionMap.addChild(contextText6);

  sectionMap.runUpdate();

  console.log('ready');
}

export default main;
