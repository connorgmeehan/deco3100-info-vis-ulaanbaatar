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

    graphEvents = [];

    shouldUpdateControls = false;
    oldCameraTarget = { x: 0, y: 0, z: 0 };
    oldCameraPosition = { x: 0, y: 30, z: 60 };

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
        const stations = {};
        Object.values(data.stationMetaData).forEach((val) => {
          const key = val.location;
          stations[key] = data.stationsData.find(el => el[0] === key)[1][i];
        });

        dataSegments[i] = new GraphSegmentVm(utc, temperature, stations);
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

      this.cam.position.x = hmConfig.camera.x;
      this.cam.position.y = hmConfig.camera.y;
      this.cam.position.z = hmConfig.camera.z;
      this.cam.lookAt(this.scene.position);

      this.controls = new OrbitControls(this.cam, this.renderer.domElement);
      // this.controls.maxPolarAngle = Math.PI / 2 - 0.3;
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableKeys = false;
      this.cameraPosition = this.cam.position;
      this.cameraTarget = this.scene.position;
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

      this.hideScene = this.hideScene.bind(this);
      this.showScene = this.showScene.bind(this);
      this.addProgressEvent(window.step2Progress, 2, () => this.showScene(), () => this.hideScene());

      this.showGraphElements = this.showGraphElements.bind(this);
      this.hideGraphElements = this.hideGraphElements.bind(this);
      this.addProgressEvent(window.step4Progress, 2, () => this.showGraphElements(), () => this.hideGraphElements());

      this.startRotateMap = this.startRotateMap.bind(this);
      this.startRotateMap = this.startRotateMap.bind(this);
      this.addProgressEvent(window.step2Progress, window.step4Progress, () => this.startRotateMap(), () => this.endRotateMap());

      this.showAsChart = this.showAsChart.bind(this);
      this.showAsMap = this.showAsMap.bind(this);
      this.addProgressEvent(window.step8Progress, window.stepFinal, () => this.showAsChart(), () => this.showAsMap());
    }

    handleActiveStation(station) {
      const stationData = this.data.metaData.find(s => s.location === station);
      if (stationData) {
        const focalPoint = { x: stationData.x, y: 1, z: stationData.y };
        const targetPosition = { x: stationData.x, y: 8, z: stationData.y + 0.02 };
        this.tweenCamera(focalPoint, targetPosition);
        this.segmentManager.setOpacityOnSegments(0);
      } else {
        const { x, y, z } = this.heightMapConfig.camera;
        const focalPoint = { x: 0, y: 0, z: 0 };
        const cameraPosition = { x, y, z };
        this.segmentManager.setOpacityOnSegments(1);
        this.tweenCamera(
          focalPoint,
          cameraPosition,
        )
      }
    }

    hideScene() {
      const scale = { x: this.parent.scale.x, y: this.parent.scale.y, z: this.parent.scale.z };
      const target = { x: 0.00001, y: 0.00001, z: 0.00001 };
      this.sceneScaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.parent.scale.set(scale.x, scale.y, scale.z);
        })
        .onComplete(() => {
          this.parent.visible = false;
        })
        .start();
    }

    showScene() {
      this.parent.visible = true;
      const scale = { x: this.parent.scale.x, y: this.parent.scale.y, z: this.parent.scale.z };
      const target = { x: 1, y: 1, z: 1 };
      this.sceneScaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.parent.scale.set(scale.x, scale.y, scale.z);
        })
        .start();
    }

    hideMap() {
      const scale = { x: this.plane.scale.x, y: this.plane.scale.y, z: this.plane.scale.z };
      const target = { x: 0.00001, y: 0.00001, z: 0.00001 };
      this.mapScaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.plane.scale.set(scale.x, scale.y, scale.z);
        })
        .onComplete(() => {
          this.plane.visible = false;
        })
        .start();
    }

    showMap() {
      this.plane.visible = true;
      const scale = { x: this.plane.scale.x, y: this.plane.scale.y, z: this.plane.scale.z };
      const target = { x: 1, y: 1, z: 1 };
      this.mapScaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.plane.scale.set(scale.x, scale.y, scale.z);
        })
        .start();
    }

    showGraphElements() {
      console.log('show graph elements');
      const scale = { x: 0, y: 0, z: 0 };
      const target = { x: 1, y: 1, z: 1 };

      this.segmentManager.setVisibleOnStations(true);
      this.northPointer.setVisible(true);

      this.graphScaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.segmentManager.setScaleOnStations(scale.x, scale.y, scale.z);
          this.northPointer.setScale(scale.x, scale.y, scale.z);
        })
        .start();
    }

    hideGraphElements() {
      console.log('hide graph elements');
      window.newAppState.activeStation.notify(null);

      const scale = { x: 1, y: 1, z: 1 };
      const target = { x: 0, y: 0, z: 0 };
      this.graphScaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.segmentManager.setScaleOnStations(scale.x, scale.y, scale.z);
          this.northPointer.setScale(scale.x, scale.y, scale.z);
        })
        .onComplete(() => {
          this.segmentManager.setVisibleOnStations(false);
          this.northPointer.setVisible(false);
        })
        .start();
    }

    startRotateMap() {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.1;
    }

    endRotateMap() {
      this.controls.autoRotate = false;
      this.controls.autoRotateSpeed = 0.1;
    }

    showAsChart() {
      window.newAppState.activeStation.notify(null);
      this.hideMap();
      this.hideGraphElements();

      this.segmentManager.showBlobsAsGraph();
      this.showingAsChart = true;
      const chartHeight = this.segmentManager.getTotalBlobHeight();
      const focalPoint = { x: 0, y: chartHeight / 2, z: 0 };
      const cameraPosition = { x: 0, y: chartHeight / 2, z: 600 };
      this.tweenCamera(
        focalPoint,
        cameraPosition,
      )

      // const scale = { x: 1, y: 1, z: 1 };
      // const target = { x: 0, y: 0, z: 0 };
      // const tween = new TWEEN.Tween(scale)
      //   .to(target)
      //   .onUpdate(() => {
      //     this.segmentManager.setScaleOnStations(scale.x, scale.y, scale.z);
      //   })
      //   .onComplete(() => {
      //     this.segmentManager.setVisibleOnStations(false)
      //   })
      //   .start();
    }

    showAsMap() {
      this.showMap();
      this.showGraphElements();
      this.segmentManager.showBlobsOnMap();
      const { x, y, z } = this.heightMapConfig.camera;
      this.showingAsChart = false;
      const focalPoint = { x: 0, y: 0, z: 0 };
      const cameraPosition = { x, y, z };
      this.tweenCamera(
        focalPoint,
        cameraPosition,
      );
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
