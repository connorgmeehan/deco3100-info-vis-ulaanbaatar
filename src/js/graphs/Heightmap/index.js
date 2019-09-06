import * as THREE from 'three';

import GenericGraph from '../GenericGraph';
import MultiTextureLoader from '../../helpers/MultiTextureLoader';
import DataSegment from './DataSegment';

export const HeightMapConfig = {
    width: 1024,
    height: 500,
    heightScale: 5,
    alphamapSrc: '/public/ulaanbaatar_alpha_512.jpg',
    heightmapSrc: '/public/ulaanbaatar_height_512_blurred.jpg',
    normalMapSrc: '/public/ulaanbaatar_normal_512_blurred.jpg',
    textureMapSrc: '/public/ulaanbaatar_texture_2048.jpg',
    animationDuration: 2000,

    camera: {
      x: 0,
      y: 30,
      z: 60,
      viewAngle: 45,
    },
    light: {
      x: 1200,
      y: 1200,
      z: -1200,
      intensity: 0.8,
    },
    numWeeksToShow: 5,
  }

  class Heightmap extends GenericGraph {
    scene;
    renderer;
    light;
    controls;

    shouldUpdateControls = false;
    oldCameraPosition = { x: 0, y: 0, z: 0 };
    oldTargetPositon = { x: 0, y: 0, z: 0 };

    constructor(name, graphOptions, data, hmConfig = null) {
      super(name, graphOptions, data);
      console.log(data);

      this.heightMapConfig = hmConfig;

      const texLoader = new MultiTextureLoader((textures) => {
        this.init(graphOptions, textures, hmConfig, data);
      })
      texLoader.addTexture(hmConfig.textureMapSrc, 'texturemap');
      texLoader.addTexture(hmConfig.heightmapSrc, 'heightmap');
      texLoader.addTexture(hmConfig.normalMapSrc, 'normalmap');
      texLoader.addTexture(hmConfig.alphamapSrc, 'alphamap');
    }

    init(graphOptions, textures, hmConfig, data) {
        this.data = this.formatData(data);
        this.buildScene(graphOptions, hmConfig)
    }

    formatData(data) {
      this.metaData = data.stationMetaData;

      // Format Data Segments
      const datalength = data.weatherData[1].length;
      console.log(data.stationsData.length);
      console.log(Object.keys(data.stationsData.length))
      this.dataSegments = new Array(datalength);

      for (let i = 0; i < datalength; i++) {
        const utc = data.stationsData.index[1][i];
        const temperature = data.weatherData[1][i];
        const stations = {};
        Object.values(data.stationMetaData).forEach((val) => {
          const key = val.location;
          stations[key] = data.stationsData.find(el => el[0] === key)[1][i];
        });

        this.dataSegments[i] = new DataSegment(utc, temperature, stations);
      }
    }

    buildScene(graphOptions, hmConfig) {
        // Build scene renderer and light
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xeeeeee, 0.5));

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(this.parentSection.settings.backgroundColor, 1.0);
        this.renderer.setSize(graphOptions.width, graphOptions.height);

        this.light = new THREE.DirectionalLight();
        this.light.position.set(hmConfig.light.x, hmConfig.light.y, hmConfig.light.z);
        this.light.intensity = hmConfig.light.intensity;
        this.scene.add(this.light);
    }
}

export default Heightmap;
