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
    oldCameraPosition = { x: 0, y: 0, z: 0 };
    oldTargetPositon = { x: 0, y: 0, z: 0 };

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
      this.plane = this.createHeightmap(textures);
      this.scene.add(this.plane);
      this.segmentManager = new SegmentManager(this.plane, this.camera, this.events, this.data);
      this.NorthPointer = new NorthPointer(this.plane, this.camera);
      if (this.sectionParent) {
        this.backgroundUpdater = new BackgroundUpdater(this.renderer, this.sectionParent, data);
      }
      this.render();
    }

    render = () => {
      TWEEN.update();
      if (this.shouldUpdateControls) {
        this.controls.update();
      }
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
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.1;
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
      plane.scale.set(0, 0, 0);
      return plane;
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
      this.hideMap = this.hideMap.bind(this);
      this.showMap = this.showMap.bind(this);
      this.addProgressEvent(-0.1, 2, () => this.showMap(), () => this.hideMap());
    }

    hideMap() {
      const scale = { x: this.plane.scale.x, y: this.plane.scale.y, z: this.plane.scale.z };
      const target = { x: 0, y: 0, z: 0 };
      this.scaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          console.log(scale);
          this.plane.scale.set(scale.x, scale.y, scale.z);
        })
        .start();
    }

    showMap() {
      const scale = { x: this.plane.scale.x, y: this.plane.scale.y, z: this.plane.scale.z };
      const target = { x: 1, y: 1, z: 1 };
      this.scaleTween = new TWEEN.Tween(scale)
        .to(target, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          console.log(scale);
          this.plane.scale.set(scale.x, scale.y, scale.z);
        })
        .start();
    }
}

export default Heightmap;
