import * as THREE from 'three';

class PollutionStation {
  scene;
  name;
  data;
  p = new THREE.Vector3();

  constructor(scene, events, data, stationMetaData) {
    this.scene = scene;
    this.data = data;
    this.name = stationMetaData.location;
    this.events = events;

    this.p.set(stationMetaData.x, 1, stationMetaData.z);

    this.init();
  }

  init() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(this.p);

    this.scene.add(cube);
  }

  update(scrollOffset, progress) {

  }
}

export default PollutionStation;
