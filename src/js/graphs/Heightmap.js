/* eslint-disable class-methods-use-this */
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import Stats from 'stats-js';

import THREEx from '../state/Threex.DomEvents';
import GenericGraph from './GenericGraph';
import PollutionStation from './Heightmap_PollutionStation';

export const HeightMapConfig = {
  width: 1024,
  height: 500,
  heightmapSrc: '/public/heightmap.png',
  normalMapSrc: '/public/normalmap.png',
  textureMapSrc: '/public/texturemap.png',

  camera: {
    x: 0,
    y: 30,
    z: 40,
    viewAngle: 45,
  },
  light: {
    x: 1200,
    y: 1200,
    z: -1200,
    intensity: 0.8,
  },
}

class Heightmap extends GenericGraph {
  scene;
  renderer;
  light;
  controls;

  pollutionData;
  stationMetaData;
  weatherData;

  pollutionStations = [];
  dataLength;

  constructor(name, graphOptions, data, hmConfig = null) {
    super(name, graphOptions, data);

    this.stats = new Stats();
    this.stats.showPanel(1);
    this.element.appendChild(this.stats.dom);

    const loader = new THREE.TextureLoader();
    const textures = {
      heightmap: null,
      normalmap: null,
      texturemap: null,
    }

    const checkTextures = () => {
      if (textures.heightmap && textures.normalmap && textures.texturemap) {
        this.init(graphOptions, textures, hmConfig);
      }
    }

    loader.load(hmConfig.heightmapSrc,
      (tex) => {
        textures.heightmap = tex;
        checkTextures();
      });
    loader.load(hmConfig.normalMapSrc,
      (tex) => {
        textures.normalmap = tex;
        checkTextures();
      });
    loader.load(hmConfig.textureMapSrc,
      (tex) => {
        textures.texturemap = tex;
        checkTextures();
      });

  console.log(this.data.pollutionData);
}

  init(graphOptions, textures, hmConfig) {
    console.log(`Heightmap::init(graphOptions: ${graphOptions}, textures: ${textures}, hmConfig: ${hmConfig})`);
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xeeeeee, 0.5));

    this.cam = new THREE.PerspectiveCamera(
      hmConfig.camera.viewAngle,
      graphOptions.width / graphOptions.height,
      0.1,
      1000,
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x333333, 1.0);
    this.renderer.setSize(graphOptions.width, graphOptions.height);
    this.renderer.getMaxAnisotropy();

    this.light = new THREE.DirectionalLight();
    this.light.position.set(hmConfig.light.x, hmConfig.light.y, hmConfig.light.z);
    this.light.intensity = hmConfig.light.intensity;
    this.scene.add(this.light);

    this.cam.position.x = hmConfig.camera.x;
    this.cam.position.y = hmConfig.camera.y;
    this.cam.position.z = hmConfig.camera.z;
    this.cam.lookAt(this.scene.position);

    this.createGeometryFromMap(textures);

    this.events = new THREEx.DomEvents(this.cam, this.renderer.domElement);

    console.log(this.data.stationMetaData);
    this.data.stationMetaData.forEach((station) => {
      const stationData = this.data.stationsData.find(el => el[0] === station.location)
      this.pollutionStations.push(new PollutionStation(this.scene, this.events, stationData, station));
    });

    this.element.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.cam, this.renderer.domElement);

    this.render();
  }

  createGeometryFromMap(textures) {
    const { heightmap, normalmap, texturemap } = textures;
    const maxHeight = 5;


    this.planeGeometry = new THREE.PlaneGeometry(
      60, 60,
      heightmap.image.naturalWidth - 1, heightmap.image.naturalHeight - 1,
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0,
      roughness: 1,
      displacementMap: heightmap,
      displacementScale: maxHeight,
      // wireframe: true,
      // flatShading: true,
      normalMap: normalmap,
      map: texturemap,
    })

    this.plane = new THREE.Mesh(this.planeGeometry, material);
    this.plane.rotation.x = -Math.PI / 2;

    this.scene.add(this.plane);
  }

  render = () => {
    this.stats.begin();

    this.controls.update();
    this.renderer.render(this.scene, this.cam);

    this.stats.end();
    requestAnimationFrame(this.render);
  }

  update(progress) {
    this.stats.begin();

    for (let i = 0; i < this.pollutionStations.length; i++) {
      this.pollutionStations[i].update(progress);
    }
    
    this.stats.end();
  } 
}

export default Heightmap;
