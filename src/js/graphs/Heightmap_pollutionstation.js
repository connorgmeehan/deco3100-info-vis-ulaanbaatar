/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import * as THREE from 'three';

class PollutionStation {
  scene;
  name;
  data;
  p = { x: -1, y: -1, z: -1 };

  constructor(scene, events, data, stationMetaData) {
    this.scene = scene;
    this.data = data;
    this.name = stationMetaData.location;
    this.events = events;

    this.p.x = stationMetaData.x;
    this.p.y = 1;
    this.p.z = stationMetaData.y;

    this.init();
  }

  init() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.set(this.p.x, this.p.y, this.p.z);

    // Bind app state listener
    window.appState.selectedStation.subscribe(this._onStationStateChange);

    // Bind THREEJS events
    this.events.bind(this.cube, 'mouseover', this._onMouseOver);
    this.events.bind(this.cube, 'mouseout', this._onMouseOut);

    this.scene.add(this.cube);
  }

  update(scrollOffset, progress) {

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
    window.appState.selectedStation.notify(null);
  }
}

export default PollutionStation;
