/* eslint-disable class-methods-use-this */
import * as THREE from 'three';
import clamp from 'clamp';
import PreviewPlane, { PreviewPlaneSettings } from './Heightmap_PreviewPlane';
import PollutionBlob, { PollutionBlobSettings } from './Heightmap_PollutionBlob';
import mapVal from '../helpers/mapVal';

const NUM_WEEKS_TO_SHOW = 5;
const CAMERA_OFFSET_HEIGHT = 5;

class PollutionStation {
  scene;
  name;
  data;
  datalength;
  p = { x: -1, y: -1, z: -1 };

  pollutionBlobs = []; // Stores the THREE mesh's for each datapoint
  pollutionBlobTheta = -1; // Scale to multiply progress by and recieve the most recent blobs data

  constructor(scene, events, data, stationMetaData) {
    this.scene = scene;
    this.data = data;
    this.dataLength = data[1].length;
    this.name = stationMetaData.location;
    this.filename = stationMetaData.filename;
    this.events = events;

    this.p.x = stationMetaData.x;
    this.p.y = 1;
    this.p.z = stationMetaData.y;

    this.pollutionBlobTheta = 1.0 / (this.data[1].length - 1);
    this.maxHeight = 30;
    this.pollutionStepDistance = this.maxHeight / NUM_WEEKS_TO_SHOW;
    this.pollutionRiseScale = this.pollutionStepDistance / this.pollutionBlobTheta / 2;

    // Setup preview plane
    this.previewPaneSettings = PreviewPlaneSettings;
    this.previewPaneSettings.location = stationMetaData.location;
    this.previewPaneSettings.filename = stationMetaData.filename;
    this.previewPaneSettings.position = this.p;
    this.previewPlane = new PreviewPlane(this.scene, this.events, this.previewPaneSettings);

    this.init();
  }

  init() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.set(this.p.x, this.p.y, this.p.z);

    const pollutionBlobSettings = PollutionBlobSettings;
    pollutionBlobSettings.scale = 20;
    pollutionBlobSettings.maxPollution = 500;
    pollutionBlobSettings.origin = this.p;

    for (let i = 0; i < NUM_WEEKS_TO_SHOW; i++) {
      this.pollutionBlobs.push(new PollutionBlob(this.scene, this.events, pollutionBlobSettings, this.data, this))
    }

    // Bind app state listener
    window.appState.hoveredStation.subscribe(this._onStationStateChange);

    // Bind THREEJS events
    this.events.bind(this.cube, 'mouseover', this._onMouseOver);
    this.events.bind(this.cube, 'mouseout', this._onMouseOut);
    this.events.bind(this.cube, 'mousedown', this._onMouseDown);

    this.scene.add(this.cube);
  }

  update(progress) {
    const offset = progress * 1.0 / this.pollutionBlobTheta;
    const dataOffset = Math.floor(offset);
    console.log(this.data);
    const { length } = this.data[1];
    const maxToShow = clamp(Math.round(mapVal(progress, 0, 1, 0, length)), 0, length);

    // console.log(this.data.stationsData.index[1][maxToShow]);

    const positionOffset = (offset % 1.0) * this.pollutionStepDistance

    for (let i = 0; i < NUM_WEEKS_TO_SHOW; i++) {
      const dataOffsetIndex = this.dataLength - dataOffset + i;
      const blob = this.pollutionBlobs[i];

      blob.updateData(this.data[1][dataOffsetIndex], dataOffsetIndex)
      blob.setY(this.p.y + positionOffset + i * this.pollutionStepDistance);
    }
  }

  _onStationStateChange = (data) => {
    if (data === this.name) {
      this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    } else {
      this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    }
    this.cube.material = this.material;
  }

  _onMouseOver = () => {
    window.appState.hoveredStation.notify(this.name);
  }

  _onMouseOut = () => {
    if (window.appState.hoveredStation.data === this.name) {
      window.appState.hoveredStation.notify(null);
    }
  }

  _onMouseDown = () => {
    if (window.appState.selectedStation.data == null
      || window.appState.selectedStation.data.name !== this.name) {
      console.log(this.name, this.filename);
      window.appState.isViewingStation.notify(true);
      window.appState.camera.notify({
        position: {
          x: this.p.x,
          y: this.p.y + CAMERA_OFFSET_HEIGHT,
          z: this.p.z,
        },
        target: {
          x: this.p.x,
          y: this.p.y,
          z: this.p.z,
        },
        callback: () => {
          window.appState.selectedStation.notify({
            name: this.name,
            filename: this.filename,
          })
        },
      });
    }
  }
}

export default PollutionStation;
