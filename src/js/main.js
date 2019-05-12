import RadialGraph, { RadialGraphOptions } from './graphs/RadialGraph';

const main = () => {
  const data = [
    [
      { month: 1, value: 186 },
      { month: 2, value: 100 },
      { month: 3, value: 60 },
      { month: 4, value: 20 },
      { month: 5, value: 20 },
      { month: 6, value: 30 },
      { month: 7, value: 50 },
      { month: 8, value: 80 },
      { month: 9, value: 110 },
      { month: 10, value: 150 },
      { month: 11, value: 196 },
      { month: 12, value: 247 },
    ],
  ];

  const radialGraphOptions = RadialGraphOptions;
  radialGraphOptions.width = 500;
  radialGraphOptions.height = 500;
  const graph = new RadialGraph('body', data, radialGraphOptions);
  graph.setTitle('PM2.5 Concentration in Ulaanbaatar 2017 by Month');

  console.log('ready');
}

export default main;
