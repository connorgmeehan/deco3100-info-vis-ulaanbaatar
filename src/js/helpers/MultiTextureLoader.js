import * as THREE from 'three';

class MultiTextureLoader {
  textures = {};
  hasExecutedCallback = false;

  constructor(callback) {
    this.callback = callback;
    this.toLoad = [];
    this.loader = new THREE.TextureLoader();
  }

  addTexture(path, key) {
    this.textures[key] = null;
    this.loader.load(path,
      (tex) => {
        this.textures[key] = tex;
        this.checkLoadeded();
      });
  }

  checkLoadeded() {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in this.textures) {
      if (this.textures[key] === null) {
        return;
      }
    }
    this.hasExecutedCallback = true;
    this.callback(this.textures);
  }
}

export default MultiTextureLoader;
