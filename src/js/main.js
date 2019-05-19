import * as d3 from 'd3';
import groupBy from './helpers/groupBy';
import Section from './components/Section';
import RadialGraph, { RadialGraphOptions } from './graphs/RadialGraph';


const main = () => {
  d3.csv('/public/all_stations_pm25_2017.csv').then((data) => {
    const groupedData = groupBy(data, 'location');
    const formattedData = Object.keys(groupedData).map(key => groupedData[key]);
    console.log(formattedData);

    const SectionIntro = new Section(2000, 'Intro');
    const genericOptionsRadial = {
      position: {
        x: 200,
        y: 300,
      },
      dimensions: {
        width: 500,
        height: 500,
      },
    };
    const radialGraphOptions = RadialGraphOptions;
    radialGraphOptions.width = 500;
    radialGraphOptions.height = 500;
    const radialGraph = new RadialGraph('Radial', genericOptionsRadial, formattedData, radialGraphOptions);
    SectionIntro.addChild(radialGraph);
  });

  console.log('ready');
}

export default main;
