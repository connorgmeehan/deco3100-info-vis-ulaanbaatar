import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import TWEEN from '@tweenjs/tween.js';

import GenericGraph, { GraphEvent } from '../GenericGraph';
import MultiTextureLoader from '../../helpers/MultiTextureLoader';
import { GraphSegmentVm } from './GraphSegment';
import THREEx from '../../state/Threex.DomEvents';

import SegmentManager from './SegmentManager';
import NorthPointer from './NorthPointer';
import BackgroundUpdater from './BackgroundUpdater';

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
      y: 45,
      z: 70,
      viewAngle: 45,
    },
    target: {
      x: 0,
      y: 5,
      z: 0,
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

    graphEvents = [];

    constructor(name, graphOptions, data, hmConfig = HeightMapConfig, sectionParent = null) {
      super(name, graphOptions, data);
      console.log(data);
      this.sectionParent = sectionParent;

      this.heightMapConfig = hmConfig;

      const texLoader = new MultiTextureLoader((textures) => {
        this.init(graphOptions, textures, hmConfig, data);
        this.bindGraphEvents();
    })
      texLoader.addTexture(hmConfig.textureMapSrc, 'texturemap');
      texLoader.addTexture(hmConfig.heightmapSrc, 'heightmap');
      texLoader.addTexture(hmConfig.normalMapSrc, 'normalmap');
      texLoader.addTexture(hmConfig.alphamapSrc, 'alphamap');
    }

    init(graphOptions, textures, hmConfig, data) {
      this.data = this.formatData(data);
      this.buildScene(graphOptions, hmConfig)
      this.element.appendChild(this.renderer.domElement);
      this.buildCamera(graphOptions, hmConfig);
      this.events = new THREEx.DomEvents(this.cam, this.renderer.domElement);
      const { parent, plane } = this.createHeightmap(textures);

      this.parent = parent;
      this.plane = plane;
      this.scene.add(this.parent);

      this.segmentManager = new SegmentManager(this.parent, this.camera, this.events, this.data);
      this.northPointer = new NorthPointer(this.parent, this.camera);
      this.northPointer.setVisible(false)
      this.northPointer.setScale(0, 0, 0);
      if (this.sectionParent) {
        this.backgroundUpdater = new BackgroundUpdater(this.renderer, this.sectionParent, data);
      }

      this.render();
    }

    render = () => {
      TWEEN.update();
      this.controls.update();
      this.renderer.render(this.scene, this.cam);

      requestAnimationFrame(this.render);
    }

    // eslint-disable-next-line class-methods-use-this
    formatData(data) {
      const metaData = data.stationMetaData;

      // Format Data Segments
      const datalength = data.weatherData[1].length;
      console.log(data.stationsData.length);
      console.log(Object.keys(data.stationsData.length))
      const dataSegments = new Array(datalength);

      for (let i = 0; i < datalength; i++) {
        const utc = data.stationsData.index[1][i];
        const temperature = data.weatherData[1][i];
        const text = data.textData[1][i];

        let averagePollution = 0;
        const stations = {};
        Object.values(data.stationMetaData).forEach((val) => {
          const key = val.location;
          stations[key] = data.stationsData.find(el => el[0] === key)[1][i];
          averagePollution += stations[key];
        });
        averagePollution /= Object.keys(stations).length;

        dataSegments[i] = new GraphSegmentVm(utc, averagePollution, temperature, stations, text);
      }

      return { dataSegments, metaData };
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

    buildCamera(graphOptions, hmConfig) {
      // Build camera and orbit controls
      this.cam = new THREE.PerspectiveCamera(
        hmConfig.camera.viewAngle,
        graphOptions.width / graphOptions.height,
        0.1,
        1000,
      );

      this.cam.position.set(hmConfig.camera.x, hmConfig.camera.y, hmConfig.camera.z);

      this.controls = new OrbitControls(this.cam, this.renderer.domElement);
      this.controls.maxPolarAngle = Math.PI / 2 - 0.3;
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableKeys = false;
      this.cameraPosition = this.cam.position;
      this.controls.target.set(this.heightMapConfig.target.x, this.heightMapConfig.target.y, this.heightMapConfig.target.z);
    }

    createHeightmap(textures) {
      const {
        heightmap, normalmap, texturemap, alphamap,
       } = textures;

      const planeGeometry = new THREE.PlaneGeometry(
        60, 60,
        heightmap.image.naturalWidth - 1, heightmap.image.naturalHeight - 1,
      );
      planeGeometry.rotateX(-Math.PI / 2);

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

      const plane = new THREE.Mesh(planeGeometry, material);

      const parent = new THREE.Object3D();
      parent.add(plane);
      const initScale = 0.0000001;
      parent.scale.set(initScale, initScale, initScale);
      return { parent, plane };
    }

    update(progress) {
      if (this.segmentManager) {
        this.segmentManager.update(progress);
      }

      if (this.graphEvents.length > 0) {
        this.graphEvents.forEach((event) => {
          event.update(progress);
        });
      }
    }

    addProgressEvent(min, max, startFn, endFn) {
      this.graphEvents.push(new GraphEvent(min, max, startFn, endFn));
    }

    bindGraphEvents() {
      window.newAppState.activeStation.subscribe(station => this.handleActiveStation(station));

      this.handleStartShowScene = this.handleStartShowScene.bind(this);
      this.handleEndShowScene = this.handleEndShowScene.bind(this);
      this.addProgressEvent(window.step2Progress, window.stepFinal, () => this.handleStartShowScene(), () => this.handleEndShowScene());

      this.handleStartGraphElements = this.handleStartGraphElements.bind(this);
      this.handleEndGraphElements = this.handleEndGraphElements.bind(this);
      this.addProgressEvent(window.step4Progress, window.step8Progress, () => this.handleStartGraphElements(), () => this.handleEndGraphElements());

      this.handleStartRotateMap = this.handleStartRotateMap.bind(this);
      this.handleEndRotateMap = this.handleEndRotateMap.bind(this);
      this.addProgressEvent(window.step2Progress, window.step4Progress, () => this.handleStartRotateMap(), () => this.handleEndRotateMap());

      this.handleStartShowAsChart = this.handleStartShowAsChart.bind(this);
      this.handleEndShowAsChart = this.handleEndShowAsChart.bind(this);
      this.addProgressEvent(window.step8Progress, window.stepFinal, () => this.handleStartShowAsChart(), () => this.handleEndShowAsChart());

      this.handleStartShowAsChart = this.handleStartShowAsChart.bind(this);
      this.handleEndShowAsChart = this.handleEndShowAsChart.bind(this);
      this.addProgressEvent(window.step8Progress, window.stepFinal, () => this.handleStartShowAsChart(), () => this.handleEndShowAsChart());

      this.handleStartShowSeperated = this.handleStartShowSeperated.bind(this);
      this.handleEndShowSeperated = this.handleEndShowSeperated.bind(this);
      this.addProgressEvent(window.step9Progress, window.stepFinal, () => this.handleStartShowSeperated(), () => this.handleEndShowSeperated());
    }

    handleStartShowScene() {
      console.log('handleStartShowScene');
      this.setSceneScale(1, 1, 1);
    }
    handleEndShowScene() {
      console.log('handleEndShowScene');
      this.setSceneScale(0, 0, 0);
    }

    handleStartGraphElements() {
      console.log('handleStartGraphElements');
      this.setStationsScale(1, 1, 1);
      this.setNorthPointerScale(1, 1, 1);
      this.setTextDiskCircleScale(1, 1, 1);
    }
    handleEndGraphElements() {
      console.log('handleEndGraphElements');
      this.setStationsScale(0, 0, 0);
      this.setNorthPointerScale(0, 0, 0);
      this.setTextDiskCircleScale(0, 0, 0);
    }

    handleStartRotateMap() {
      console.log('handleStartRotateMap');
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.1;
    }
    handleEndRotateMap() {
      console.log('handleEndRotateMap');
      this.controls.autoRotate = false;
      this.controls.autoRotateSpeed = 0.1;
    }

    handleStartShowAsChart() {
      console.log('handleStartShowAsChart');
      window.newAppState.activeStation.notify(null);
      window.newAppState.scrollUTC.notify(null);
      window.newAppState.scrollTemperature.notify(null);
      this.setMapScale(0, 0, 0);
      this.setStationsTextShow(true);
      this.segmentManager.showBlobsAsGraph();

      const chartHeight = this.segmentManager.getTotalBlobHeight();
      const focalPoint = { x: 0, y: chartHeight / 2, z: 0 };
      const cameraPosition = { x: 0, y: chartHeight / 2, z: 600 };
      this.tweenCamera(
        focalPoint,
        cameraPosition,
      )
    }
    handleEndShowAsChart() {
      console.log('handleEndShowAsChart');
      this.setMapScale(1, 1, 1);
      this.setStationsTextShow(false);
      this.segmentManager.showBlobsOnMap();

      const { x, y, z } = this.heightMapConfig.camera;
      const focalPoint = this.heightMapConfig.target;
      const cameraPosition = { x, y, z };
      this.tweenCamera(
        focalPoint,
        cameraPosition,
      );
    }

    handleStartShowSeperated() {
      this.segmentManager.showBlobsAsGraphCategorised();
    }
    handleEndShowSeperated() {
      this.segmentManager.showBlobsAsGraph();
    }

    handleActiveStation(station) {
      console.log('handleActiveStation', station);
      const stationData = this.data.metaData.find(s => s.location === station);
      if (stationData) {
        const focalPoint = { x: stationData.x, y: 1, z: stationData.y };
        const targetPosition = { x: stationData.x, y: 8, z: stationData.y + 0.02 };
        this.tweenCamera(focalPoint, targetPosition);
        this.setBlobOpacity(0);
      } else {
        const { x, y, z } = this.heightMapConfig.camera;
        const focalPoint = { x: 0, y: 0, z: 0 };
        const cameraPosition = { x, y, z };
        this.setBlobOpacity(1);
        this.tweenCamera(
          focalPoint,
          cameraPosition,
        )
      }
    }

    setSceneScale(x, y, z) {
      console.log('setSceneScale', x, y, z);
      const target = { x, y, z };
      if (x !== 0 || y !== 0 || z !== 0) this.parent.visible = true;
      this.sceneScaleTween = new TWEEN.Tween(this.parent.scale)
        .to(target, 500)
        .onComplete(() => {
          console.log('setSceneScale', x, y, z);
          if (x === 0 || y === 0 || z === 0) this.parent.visible = false;
        })
        .start();
    }
    setMapScale(x, y, z) {
      console.log('setMapScale', x, y, z);
      const target = { x, y, z };
      if (x !== 0 || y !== 0 || z !== 0) this.plane.visible = true;
      this.mapScaleTween = new TWEEN.Tween(this.plane.scale)
        .to(target, 500)
        .onComplete(() => {
        console.log('setMapScale done ', x, y, z);
          if (x === 0 || y === 0 || z === 0) this.plane.visible = false;
        })
        .start();
    }
    setStationsScale(x, y, z) {
        this.segmentManager.animateScaleOnStations(x, y, z);
    }
    setNorthPointerScale(x, y, z) {
      this.northPointer.animateScale(x, y, z);
    }
    setTextDiskCircleScale(x, y, z) {
      this.segmentManager.animateScaleOnTextDiskCircles(x, y, z);
    }
    setStationsTextShow(show) {
      this.segmentManager.showStationsText(show);
    }
    setBlobOpacity(opacity) {
      this.segmentManager.animateOpacityOnBlobs(opacity);
    }

    tweenCamera(targetFocalPoint, targetPosition, callback = null) {
      console.log('tween camera', targetFocalPoint, targetPosition);
      this.targetTween = new TWEEN.Tween(this.controls.target)
        .to(targetFocalPoint, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      this.positionTween = new TWEEN.Tween(this.cameraPosition)
        .to(targetPosition, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.cam.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        })
        .onComplete(() => {
          if (callback) {
            callback();
          }
        })
        .start();
    }
}

export default Heightmap;
