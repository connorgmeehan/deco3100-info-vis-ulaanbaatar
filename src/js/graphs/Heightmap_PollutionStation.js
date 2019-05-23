/* eslint-disable class-methods-use-this */
import * as THREE from 'three';
import PollutionBlob, { PollutionBlobSettings } from './Heightmap_PollutionBlob';

const NUM_WEEKS_TO_SHOW = 5;

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
    this.events = events;

    this.p.x = stationMetaData.x;
    this.p.y = 1;
    this.p.z = stationMetaData.y;

    this.pollutionBlobTheta = 1.0 / (this.data[1].length - 1);

    this.maxHeight = 20;
    this.pollutionStepDistance = this.maxHeight / NUM_WEEKS_TO_SHOW;
    this.pollutionRiseScale = this.pollutionStepDistance / this.pollutionBlobTheta / 2;

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
    window.appState.selectedStation.subscribe(this._onStationStateChange);

    // Bind THREEJS events
    this.events.bind(this.cube, 'mouseover', this._onMouseOver);
    this.events.bind(this.cube, 'mouseout', this._onMouseOut);

    this.scene.add(this.cube);
  }

  update(progress) {
    const offset = progress * 1.0 / this.pollutionBlobTheta;
    const dataOffset = Math.floor(offset);
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
    window.appState.selectedStation.notify(this.name);
  }

  _onMouseOut = () => {
    if (window.appState.selectedStation.data === this.name) {
      window.appState.selectedStation.notify(null);
    }
  }
}

export default PollutionStation;
