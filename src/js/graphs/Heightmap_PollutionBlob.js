import * as THREE from 'three';

const WIDTH_SEGMENTS = 8;
const HEIGHT_SEGMENTS = 8;
const STATION_OFFSET = 0.25;

export const PollutionBlobSettings = {
  maxPollution: 500,
  scale: 10,
  origin: { x: 0, y: 0, z: 0 },
};

class PollutionBlob {
  scene; // THREE JS Scene
  data;

  geometry;
  material;
  mesh;

  constructor(scene, settings, data) {
    this.scene = scene;
    this.data = data;
    this.origin = settings.origin;
    this.settings = settings;

    this.init();
  }

  init() {
    this.geometry = new THREE.SphereGeometry(0.001, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
    this.material = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      opacity: 0.0,
      blending: THREE.MultiplyBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.obj = new THREE.Object3D();

    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.scene.add(this.mesh);
  }

  updateData(d) {
    if (d && this.d !== d) {
      this.d = d;
      this.radius = d / ((4 / 3) * Math.PI) / this.settings.maxPollution;
      this.mesh.material.opacity = d / this.settings.maxPollution;
      this.mesh.material.color.r = d / this.settings.maxPollution;
      this.mesh.geometry = new THREE.SphereGeometry(this.radius, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
    } else {
      this.mesh.material.color.opacity = 0;
    }
  }

  setPosition(p) {
    this.mesh.position.set(p.x, p.y, p.z);
  }

  setX(x) {
    this.mesh.position.setX(x);
  }

  setY(y) {
    this.mesh.position.setY(y + STATION_OFFSET);
    const dist = Math.abs(y - this.origin.y);
    const scale = dist / (1 + dist) * this.settings.scale;
    this.mesh.scale.set(scale, scale, scale);
  }

  setZ(z) {
    this.mesh.position.setZ(z);
  }
}

export default PollutionBlob;
