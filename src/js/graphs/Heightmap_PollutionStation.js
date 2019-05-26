/* eslint-disable class-methods-use-this */
import * as THREE from 'three';
import TextSprite from 'three.textsprite';

import PreviewPlane, { PreviewPlaneSettings } from './Heightmap_PreviewPlane';
import PollutionBlob, { PollutionBlobSettings } from './Heightmap_PollutionBlob';

export const PollutionStationSettings = {
  maxHeight: 30,
  numWeeksToShow: 5,
  cameraOffsetHeight: 5,
}

class PollutionStation {
  scene;
  name;
  data;
  datalength;
  p = { x: -1, y: -1, z: -1 };

  pollutionBlobs = []; // Stores the THREE mesh's for each datapoint
  pollutionBlobTheta = -1; // Scale to multiply progress by and recieve the most recent blobs data

  constructor(scene, camera, events, data, stationMetaData, pollutionStationSettings) {
    this.scene = scene;
    this.camera = camera;
    this.data = data;
    this.dataLength = data[1].length;
    this.stationMetaData = stationMetaData;
    this.name = stationMetaData.location;
    this.filename = stationMetaData.filename;
    this.events = events;

    this.p.x = stationMetaData.x;
    this.p.y = 1;
    this.p.z = stationMetaData.y;

    this.pollutionBlobTheta = 1.0 / (this.data[1].length - 1);
    this.maxHeight = pollutionStationSettings.maxHeight;
    this.numWeeksToShow = pollutionStationSettings.numWeeksToShow;
    this.cameraOffsetHeight = pollutionStationSettings.cameraOffsetHeight;
    this.pollutionStepDistance = this.maxHeight / this.numWeeksToShow;
    this.pollutionRiseScale = this.pollutionStepDistance / this.pollutionBlobTheta / 2;
    this.pollutionBlobYOffset = this.maxHeight - this.pollutionStepDistance;

    // Setup preview plane
    this.previewPaneSettings = PreviewPlaneSettings;
    this.previewPaneSettings.location = stationMetaData.location;
    this.previewPaneSettings.filename = stationMetaData.filename;
    this.color = stationMetaData.color;
    this.previewPaneSettings.position = this.p;
    this.previewPlane = new PreviewPlane(this.scene, this.events, this.previewPaneSettings);

    this.init();
  }

  init() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: this.color });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.set(this.p.x, this.p.y, this.p.z);

    const pollutionBlobSettings = PollutionBlobSettings;
    pollutionBlobSettings.scale = 20;
    pollutionBlobSettings.maxPollution = 500;
    pollutionBlobSettings.origin = this.p;

    for (let i = 0; i < this.numWeeksToShow; i++) {
      this.pollutionBlobs.push(
        new PollutionBlob(this.scene, this.events, pollutionBlobSettings, this.data, this),
        )
    }

    // Bind app state listener
    window.appState.hoveredStation.subscribe(this._onStationStateChange);

    // Bind THREEJS events
    this.events.bind(this.cube, 'mouseover', this._onMouseOver);
    this.events.bind(this.cube, 'mouseout', this._onMouseOut);
    this.events.bind(this.cube, 'mousedown', this._onMouseDown);

    this.scene.add(this.cube);
  }

  update(dataProgress, dataIndex, stepDistanceMultiplier) {
    for (let i = 0; i < this.numWeeksToShow; i++) {
      const blob = this.pollutionBlobs[i];
      const scrollModulatedOffset = (dataProgress % 1.0) * this.pollutionStepDistance;
      const newData = this.data[1][dataIndex + i];
      const newPosition = (
        this.p.y
        + scrollModulatedOffset
        - i * this.pollutionStepDistance
        + this.pollutionBlobYOffset
      ) * stepDistanceMultiplier;
      blob.updateData(newData, dataIndex)
      blob.setY(newPosition);
    }
  }

  _onStationStateChange = (data) => {
    if (data === this.name) {
      this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    } else {
      this.material = new THREE.MeshBasicMaterial({ color: this.color });
    }
    this.cube.material = this.material;
  }

  _onMouseOver = () => {
    if (window.appState.hoveredStation.data !== this.name) {
      window.appState.hoveredStation.notify(this.name);
    }
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
          y: this.p.y + this.cameraOffsetHeight,
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
