import * as THREE from 'three';

class PollutionStation {
  scene;
  name;
  data;
  p = { x: -1, y: -1, z: -1 };

  constructor(scene, data, stationMetaData) {
    this.scene = scene;
    this.data = data;
    this.name = stationMetaData.location;

    this.p.x = stationMetaData.x;
    this.p.y = 1;
    this.p.z = stationMetaData.y;

    this.init();
  }

  init() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(this.p.x, this.p.y, this.p.z);

    this.scene.add(cube);
  }

  update(scrollOffset, progress) {

  }
}

export default PollutionStation;
