import * as THREE from 'three';

class MultiTextureLoader {
  textures = {};
  hasExecutedCallback = false;

  constructor(callback) {
    this.callback = callback;
    this.loader = new THREE.TextureLoader();
  }

  addTexture(path) {
    this.textures.texturemap = null;
    this.loader.load(path,
      (tex) => {
        this.textures.texturemap = tex;
        this.checkLoadeded();
      });
  }

  addHeightmap(path) {
    this.textures.heightmap = null;
    this.loader.load(path,
      (tex) => {
        this.textures.heightmap = tex;
        this.checkLoadeded();
      });
  }

  addNormalMap(path) {
    this.textures.normalmap = null;
    this.loader.load(path,
      (tex) => {
        this.textures.normalmap = tex;
        this.checkLoadeded();
      });
  }

  addAlphaMap(path) {
    this.textures.alphamap = null;
    this.loader.load(path,
      (tex) => {
        this.textures.alphamap = tex;
        this.checkLoadeded();
      });
  }

  checkLoadeded() {
    // eslint-disable-next-line no-restricted-syntax
    for (let key in this.textures) {
      if (this.textures[key] === null) {
        return;
      }
    }
    this.hasExecutedCallback = true;
    this.callback(this.textures);
  }
}

export default MultiTextureLoader;
