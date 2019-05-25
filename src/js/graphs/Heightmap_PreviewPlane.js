import * as THREE from 'three';

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

    this.planeGeometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      2, 2,
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

    window.appState.selectedStation.subscribe(this._onSelectedStationStateChange)
    console.log(this);
  }

  onClick = () => {
    this.events.bind(this.plane, 'mouseup', () => {
      window.appState.selectedStation.notify(null);
    });
  }

  _onSelectedStationStateChange = (selectedStation) => {
    console.log(`Sectected Station : ${selectedStation}`);
    if (selectedStation.filename === this.filename) {
      console.log(`PreviewPlane::onActivate() -> srcTexture: ${this.srcTexture} texture: ${this.texture}`);
      const textureUrl = `/public/${selectedStation.filename}_${this.resolution}.jpg`;
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(textureUrl, (texture) => {
        this.texture = texture;
        this.material.map = texture;
        this.material.needsUpdate = true;
        this.material.opacity = 1;
      });
      this.scene.add(this.plane);
    } else {
      this.material.opacity = 0;
      if (this.texture) {
        this.texture.dispose();
      }
      this.material.map = null;
      this.scene.remove(this.plane);
    }
  }
}

export default PreviewPlane;
