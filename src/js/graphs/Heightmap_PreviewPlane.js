import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export const PreviewPlaneSettings = {
  position: {
    x: -1,
    y: -1,
    z: -1,
  },
  width: 10,
  height: 10,
  location: '',
  filename: '',
  resolution: 2048,
};

class PreviewPlane {
  scene;
  plane;
  material;
  image;
  texture = null;

  isPlaneBound = false;

  position;
  width;
  height;
  location;
  filename;
  resolution;

  constructor(scene, events, {
 position, width, height, location, filename, resolution,
 }) {
    this.scene = scene;
    this.events = events;

    this.position = position;
    this.width = width;
    this.height = height;
    this.location = location;
    this.filename = filename;
    this.resolution = resolution;

    // this.planeGeometry = new THREE.PlaneGeometry(
    //   this.width,
    //   this.height,
    //   2, 2,
    // );

    this.planeGeometry = new THREE.BoxGeometry(
      this.width, this.height, 1,
      1, 1, 1,
    );

    this.material = new THREE.MeshStandardMaterial({
      transparent: true,
      metalness: 0,
      roughness: 1,
      opacity: 0,
    });

    this.plane = new THREE.Mesh(this.planeGeometry, this.material);
    this.plane.position.x = position.x;
    this.plane.position.y = position.y + 1;
    this.plane.position.z = position.z;
    this.plane.rotation.x = -Math.PI / 2;

    // TODO Bind and unbind depending on membervariable flage
    window.appState.selectedStation.subscribe(this._onSelectedStationStateChange)
  }

  _onClick = () => {
    window.appState.selectedStation.notify(null);
    window.appState.camera.notify({ position: null, target: null, callback: null });
  }

_onSelectedStationStateChange = (selectedStation) => {
    if (selectedStation && selectedStation.filename === this.filename) {
      this.selected = true;
      const textureUrl = `/public/${selectedStation.filename}_${this.resolution}.jpg`;
      const textureLoader = new THREE.TextureLoader();

      textureLoader.load(textureUrl, (texture) => {
        this.texture = texture;
        this.material.map = texture;
        this.material.needsUpdate = true;
        this.material.opacity = 1;
      });

      if (!this.isPlaneBound) {
        this.events.bind(this.plane, 'mousedown', this._onClick);
        this.isPlaneBound = true;
      }


      this.scene.add(this.plane);
    } else if (this.selected) {
      if (this.texture) {
        this.texture.dispose();
      }
      this.material.map = null;

      if (this.isPlaneBound) {
        this.events.unbind(this.plane, 'mousedown', this._onClick);
        this.isPlaneBound = false;
      }

      this.scene.remove(this.plane);
    }
  }
}

export default PreviewPlane;
