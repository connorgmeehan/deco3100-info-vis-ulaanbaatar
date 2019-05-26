/* eslint-disable class-methods-use-this */
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import Stats from 'stats-js';
import TWEEN from '@tweenjs/tween.js';
import clamp from 'clamp';

import THREEx from '../state/Threex.DomEvents';
import GenericGraph from './GenericGraph';
import PollutionStation, { PollutionStationSettings } from './Heightmap_PollutionStation';
import MultiTextureLoader from '../helpers/MultiTextureLoader';
import mapVal from '../helpers/mapVal';
import NorthPointer, { NorthPointerSettings } from './Heightmap_NorthPointer';

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

  pollutionData;
  stationMetaData;
  weatherData;

  pollutionStations = [];
  dataLength;

  shouldUpdateControls = false;
  oldCameraPosition = { x: 0, y: 0, z: 0 };
  oldTargetPositon = { x: 0, y: 0, z: 0 };

  constructor(name, graphOptions, data, hmConfig = null) {
    super(name, graphOptions, data);

    this.stats = new Stats();
    this.stats.showPanel(1);
    this.element.appendChild(this.stats.dom);
    console.log(data);

    this.heightMapConfig = hmConfig;

    const texLoader = new MultiTextureLoader((texs) => {
      this.init(graphOptions, texs, hmConfig);
    })
    texLoader.addTexture(hmConfig.textureMapSrc);
    texLoader.addHeightmap(hmConfig.heightmapSrc);
    texLoader.addNormalMap(hmConfig.normalMapSrc);
    texLoader.addAlphaMap(hmConfig.alphamapSrc);

    this.dataLength = this.data.stationsData.index[1].length;
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
    this.renderer.setClearColor(this.parentSection.settings.backgroundColor, 1.0);
    this.renderer.setSize(graphOptions.width, graphOptions.height);
    // this.renderer.getMaxAnisotropy();

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

    this.data.stationMetaData.forEach((station) => {
      const pollutionStationSettings = PollutionStationSettings;
      pollutionStationSettings.numWeeksToShow = hmConfig.numWeeksToShow;
      const stationData = this.data.stationsData.find(el => el[0] === station.location)
      stationData[1] = stationData[1].map((el, i) => ({ utc: this.data.stationsData.index[1][i], val: el }))
      this.pollutionStations.push(new PollutionStation(this.scene, this.events, stationData, station, pollutionStationSettings));
    });

    this.element.appendChild(this.renderer.domElement);

    this.buildOrbitCam()

    const northPointerSettings = NorthPointerSettings;
    this.northPointer = new NorthPointer(this.scene, this.cam, northPointerSettings);

    window.appState.camera.subscribe(data => this._onCameraChange(data));
    window.appState.isViewingStation.subscribe(data => this._onisViewingStationChange(data));

    this.render();
  }

  buildOrbitCam() {
    this.controls = new OrbitControls(this.cam, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.3;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableKeys = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.1;
  }

  createGeometryFromMap(textures) {
    const {
 heightmap, normalmap, texturemap, alphamap,
} = textures;

    this.planeGeometry = new THREE.PlaneGeometry(
      60, 60,
      heightmap.image.naturalWidth - 1, heightmap.image.naturalHeight - 1,
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0,
      roughness: 1,
      map: texturemap,
      alphaMap: alphamap,
      normalMap: normalmap,
      displacementMap: heightmap,
      displacementScale: this.heightMapConfig.heightScale,
      transparent: true,
    })

    this.plane = new THREE.Mesh(this.planeGeometry, material);
    this.plane.rotation.x = -Math.PI / 2;

    this.scene.add(this.plane);
  }

  render = () => {
    this.stats.begin();

    this.northPointer.animate();

    TWEEN.update();
    if (this.shouldUpdateControls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.cam);

    this.stats.end();

    requestAnimationFrame(this.render);
  }

  update(progress) {
    this.stats.begin();
    const dataProgress = clamp(progress * this.dataLength, 0, this.dataLength);
    const dataIndex = Math.floor(dataProgress);
    const stepDistanceMultiplier = clamp(progress, -0.1, 0) * 10 + 1;
    for (let i = 0; i < this.pollutionStations.length; i++) {
      this.pollutionStations[i].update(dataProgress, dataIndex, stepDistanceMultiplier);
    }

    this.stats.end();
  }

  onStick() {
  }

  onUnstick() {
  }

  _onisViewingStationChange = (isViewingStation) => {
    this.shouldUpdateControls = !isViewingStation;
  }

  _onCameraChange = ({ position, target, callback }) => {
    // store state of each tween
    const isComplete = {
      position: false,
      target: false,
    };
    // define validation callbackc
    const validationCallback = (name) => {
      isComplete[name] = true;
      if (callback !== null && isComplete.position && isComplete.target) {
        callback();
      }
    }
    this._handleNewCameraPosition(position, validationCallback);
    this._handleNewCameraTarget(target, validationCallback);
  }

  _handleNewCameraTarget(newTarget, validationCallback) {
    // if we're resetting to the default camera target
    if (newTarget === null) {
      newTarget = { x: 0, y: 0, z: 0 };
    }
    console.log(`Heightmap::_handleNewCameraTarget(newTarget: ${newTarget.x}, ${newTarget.y}, ${newTarget.z})`)

    // initilise the tweenedTarget to store tween (starting at old position)
    const tweenedTarget = this.oldTargetPositon;

    // Build the tween to move from tweenedTarget to newTarget over animation duration
    this.targetTween = new TWEEN.Tween(tweenedTarget)
      .to({ x: newTarget.x, y: newTarget.y, z: newTarget.z }, this.heightMapConfig.animationDuration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.cam.lookAt(tweenedTarget.x, tweenedTarget.y, tweenedTarget.z);
      })
      .onComplete(() => {
        validationCallback('target');
      })
      .start();

    // Set old target position to new target position
    this.oldTargetPositon = newTarget;
  }

  _handleNewCameraPosition(newPosition, validationCallback) {
    // If we're resetting to the default position (newPosition != null)
    if (newPosition === null) {
      newPosition = {
        x: this.heightMapConfig.camera.x,
        y: this.heightMapConfig.camera.y,
        z: this.heightMapConfig.camera.z,
      }
    }

    // Set old Camera pos to tween from / return to
    this.oldCameraPosition.x = this.cam.position.x;
    this.oldCameraPosition.y = this.cam.position.y;
    this.oldCameraPosition.z = this.cam.position.z;

    console.log(`Heightmap::_handleNewCameraPosition(newPosition: ${newPosition.x}, ${newPosition.y}, ${newPosition.z})`)

    // Initialise tween pos to store current tween
    const tweenPos = this.oldCameraPosition;

    // Build tween to new position over animationDuration
    this.positionTween = new TWEEN.Tween(tweenPos)
      .to({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      }, this.heightMapConfig.animationDuration)
      .onUpdate(() => { this.cam.position.set(tweenPos.x, tweenPos.y, tweenPos.z) })
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        validationCallback('position');
      })
      .start();
  }
}

export default Heightmap;
